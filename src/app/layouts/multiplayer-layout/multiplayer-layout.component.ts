import { KeyValuePipe } from '@angular/common'
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, viewChild, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { Room as LiveKitRoom, RoomEvent } from 'livekit-client'
import { firstValueFrom } from 'rxjs'

import { environment } from '../../../environments/environment'
import { AuthService } from '../../pages/auth/auth.service'
import { MultiplayerComponent } from '../../pages/game/multiplayer/multiplayer.component'
import { MultiplayerService } from '../../pages/game/multiplayer/multiplayer.service'
import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { LobbyComponent } from '../../pages/lobby/lobby.component'
import { ErrorWhileLoadingComponent } from '../../shared/components/error-while-loading/error-while-loading.component'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { LiveKitService } from '../../shared/services/live-kit.service'
import { PlayerService } from '../../shared/services/player.service'
import { TokenService } from '../../shared/services/token.service'
import { GameState, MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'
import { AudioComponent } from './components/audio/audio.component'
import { GameControlComponent } from './components/game-control/game-control.component'

@Component({
	selector: 'app-multiplayer-layout',
	imports: [
		LoadingComponent,
		FormsModule,
		TextFieldComponent,
		ReactiveFormsModule,
		ErrorWhileLoadingComponent,
		GameControlComponent,
		LobbyComponent,
		MultiplayerComponent,
		AudioComponent,
		KeyValuePipe,
	],
	templateUrl: './multiplayer-layout.component.html',
	styleUrl: './multiplayer-layout.component.scss',
	providers: [MultiplayerStore],
	encapsulation: ViewEncapsulation.None,
})
export class MultiplayerLayoutComponent implements OnInit, OnDestroy {
	readonly store = inject(MultiplayerStore)

	usernameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('usernameModal')

	usernameFormGroup = new FormGroup({
		username: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(1)], nonNullable: true }),
	})

	icons = { faMicrophoneSlash, faMicrophone }

	protected readonly RequestState = RequestState

	protected readonly GameState = GameState

	constructor(
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly tokenService: TokenService,
		private readonly playerService: PlayerService,
		private readonly authService: AuthService,
		private readonly liveKitService: LiveKitService,
		private readonly multiplayerService: MultiplayerService,
	) {
		this.initiateEffects()
	}

	async ngOnInit() {
		await this.getUserInformation()
	}

	async ngOnDestroy() {
		this.colyseusService.leaveRoom()
		await this.leaveLiveKitRoom()
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadConfirmation(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	setUsernameInformation() {
		if (this.usernameFormGroup.valid) {
			this.store.setPlayer(this.usernameFormGroup.controls.username.value)
			this.usernameDialog().nativeElement.close()
		}
	}

	async goToLogin() {
		this.usernameDialog().nativeElement.close()
		localStorage.setItem('redirectionUrl', this.router.url)
		await this.router.navigate(['auth', 'login'], {
			replaceUrl: false,
			skipLocationChange: true,
			onSameUrlNavigation: 'ignore',
		})
	}

	private async getUserInformation() {
		const accessToken = this.tokenService.getAccessToken()
		if (accessToken) {
			const playerName = this.playerService.getPlayer.getValue()?.name
			if (playerName) {
				this.store.setPlayer(playerName)
			} else {
				try {
					const player = await firstValueFrom(this.authService.checkToken())
					this.playerService.setPlayer = player
					this.store.setPlayer(player.name)
				} catch (e) {
					this.store.setError('Player information not found')
					console.error(e)
				}
			}
		} else {
			this.usernameDialog().nativeElement.showModal()
		}
	}

	private initiateGameRoom(playerName: string) {
		const gameId = this.activatedRoute.snapshot.paramMap.get('gameId')
		const roomId = this.activatedRoute.snapshot.paramMap.get('roomId')

		// Join a websocket room with the gameId
		if (gameId && roomId && playerName) {
			this.colyseusService.getClient.auth.token = playerName
			this.colyseusService.getClient
				.joinById<MultiplayerRoomState>(roomId, { gameId })
				.then(async (room) => {
					this.colyseusService.setRoom = room
					this.store.setColyseusRoom(room)
					sessionStorage.setItem('reconnectionToken', room.reconnectionToken)

					room.onStateChange((state) => {
						const { players, sessionScore } = state
						this.multiplayerService.sessionScore.set(sessionScore.get(room.sessionId))
						this.store.reflectGameStateChange(state)
						this.store.updateRemoteParticipants(players)
					})
					await this.initiateVoiceChat(gameId, room.sessionId)
					this.store.setPageState(RequestState.READY)
				})
				.catch((e) => {
					this.store.setError('Error joining room')
					console.error(e)
				})
		} else {
			this.store.setError('No room id provided')
		}
	}

	private async initiateVoiceChat(gameId: string, sessionId: string) {
		const room = new LiveKitRoom()
		this.store.setLiveKitRoom(room)

		// Specify the actions when events take place in the room
		// On every new Track received...
		room.on(RoomEvent.TrackSubscribed, (remoteTrack, remotePublication, remoteParticipant) => {
			this.store.addRemoteTrack(remoteParticipant.identity, remotePublication, remoteTrack.isMuted)
		})

		// On every new Track destroyed...
		room.on(RoomEvent.TrackUnsubscribed, (_remoteTrack, _remotePublication, remoteParticipant) => {
			this.store.deleteRemoteTrack(remoteParticipant.identity)
		})

		try {
			// Generate token for to be used to join the live-kit room.
			const { token } = await firstValueFrom(this.liveKitService.getToken(gameId, sessionId))

			// Connect to the live-kit room.
			await room.connect(environment.liveKitServerUrl, token)

			// Initiate the voice communication by asking permission for the mic.
			await room.localParticipant.setMicrophoneEnabled(true)

			// Set the local participant's track to state.
			this.store.setLocalTrack(room.localParticipant.audioTrackPublications.values().next().value?.audioTrack)

			// Set the local participant UI's mic state based on its state in the track.
			this.store.setMicState((room.localParticipant.trackPublications.values().next().value?.isMuted ?? true) ? MicState.MUTED : MicState.ON)

			// Set the local participant's muted state in the store.
			this.store.changePlayerMuteState(room.localParticipant.identity, room.localParticipant.trackPublications.values().next().value?.isMuted ?? true)

			// This will fire when any track is muted.
			room.on(RoomEvent.TrackMuted, (trackPublication, participant) => {
				this.store.changePlayerMuteState(participant.identity, trackPublication.isMuted)
			})

			// This will fire when any track is unmuted.
			room.on(RoomEvent.TrackUnmuted, (trackPublication, participant) => {
				this.store.changePlayerMuteState(participant.identity, trackPublication.isMuted)
			})

			// This event will fire with a list of participants who are actively speaking.
			room.on(RoomEvent.ActiveSpeakersChanged, (participants) => {
				this.store.changePlayerSpeakingState(
					participants.map((participant) => ({
						id: participant.identity,
						speaking: participant.isSpeaking,
						audioLevel: participant.audioLevel,
					})),
				)
			})

			// When the audio playback status is changed, this event will fire.
			// And I use it to resume the audio playback.
			room.on(RoomEvent.AudioPlaybackStatusChanged, (status) => {
				if (status) {
					room.startAudio()
				}
			})
		} catch (e) {
			console.error(e)
			await this.leaveLiveKitRoom()
			this.store.setMicState(MicState.ERROR)
		} finally {
			this.store.setPageState(RequestState.READY)
		}
	}

	private async leaveLiveKitRoom() {
		// Leave the room by calling the 'disconnect' method over the Room object.
		await this.store.liveKitRoom()?.disconnect()

		// Reset all variables
		this.store.setLiveKitRoom(undefined)
		this.store.setLocalTrack(undefined)
		this.store.clearRemoteTracks()
	}

	private initiateEffects() {
		effect(() => {
			const player = this.store.player()

			if (player) {
				this.initiateGameRoom(player.name)
			}
		})
	}
}
