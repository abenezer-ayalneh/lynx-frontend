import { JsonPipe, NgClass } from '@angular/common'
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, viewChild, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { Participant, Room as LiveKitRoom, RoomEvent } from 'livekit-client'
import { firstValueFrom } from 'rxjs'

import { environment } from '../../../environments/environment'
import { AuthService } from '../../pages/auth/auth.service'
import { MultiplayerComponent } from '../../pages/game/multiplayer/multiplayer.component'
import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { LobbyComponent } from '../../pages/lobby/lobby.component'
import { ErrorWhileLoadingComponent } from '../../shared/components/error-while-loading/error-while-loading.component'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'
import { PickFirstLettersPipe } from '../../shared/pipes/pick-first-letters.pipe'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { LiveKitService } from '../../shared/services/live-kit.service'
import { PlayerService } from '../../shared/services/player.service'
import { TokenService } from '../../shared/services/token.service'
import { GameState, MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'
import { GameControlComponent } from './components/game-control/game-control.component'

@Component({
	selector: 'app-multiplayer-layout',
	imports: [
		FaIconComponent,
		LoadingComponent,
		PickFirstLettersPipe,
		FormsModule,
		TextFieldComponent,
		ReactiveFormsModule,
		ErrorWhileLoadingComponent,
		GameControlComponent,
		LobbyComponent,
		MultiplayerComponent,
		NgClass,
		JsonPipe,
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
	) {
		this.initiateEffects()
	}

	async ngOnInit() {
		await this.getUserInformation()
	}

	ngOnDestroy() {
		this.colyseusService.leaveRoom()
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
				.then((room) => {
					this.colyseusService.setRoom = room
					this.store.setColyseusRoom(room)
					sessionStorage.setItem('reconnectionToken', room.reconnectionToken)

					room.onStateChange((state) => this.store.reflectGameStateChange(state))
					this.initiateVoiceChat(gameId, room.sessionId)
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

	private initiateVoiceChat(gameId: string, sessionId: string) {
		firstValueFrom(this.liveKitService.getToken(gameId, sessionId))
			.then(async ({ token }) => {
				try {
					const room = new LiveKitRoom()
					await room.connect(environment.liveKitServerUrl, token)

					this.store.setLiveKitRoom(room)

					// This enables me to show the mute status of the local player when he/she turns the mic on
					room.on(RoomEvent.LocalTrackPublished, (localTrackPublication, localParticipant) => {
						this.store.changePlayerMuteState(localParticipant.identity, localTrackPublication.isMuted)
					})

					room.on(RoomEvent.TrackSubscribed, (track, remoteTrackPublication, remoteParticipant) => {
						// track.attach()
						remoteTrackPublication.track?.attach()
						this.store.changePlayerMuteState(remoteParticipant.identity, remoteTrackPublication.isMuted)
					})

					// Add event listeners to track muting
					room.on(RoomEvent.TrackMuted, (_, participant) => {
						this.store.changePlayerMuteState(participant.identity, true)
					})

					// Add event listeners to track unmuting
					room.on(RoomEvent.TrackUnmuted, (_, participant: Participant) => {
						this.store.changePlayerMuteState(participant.identity, false)
					})

					room.on(RoomEvent.ActiveSpeakersChanged, (participants) => {
						this.store.changePlayerSpeakingState(
							participants.map((participant) => ({
								participantId: participant.identity,
								speaking: participant.isSpeaking,
								audioLevel: participant.audioLevel,
							})),
						)
					})

					// When the audio playback status is changed, this will resume the audio track
					room.on(RoomEvent.AudioPlaybackStatusChanged, (speaking) => {
						if (speaking) {
							room.startAudio()
						}
					})

					// Enables the microphone and publishes it to a new audio track
					// NOTE: it is intentional that I am passing `false` for the `setMicrophoneEnabled` method.
					// This is because an interaction is needed for the audio stream to be attached and be able to play.
					// For more info check: https://developer.chrome.com/blog/autoplay/#web_audio
					room.localParticipant
						.setMicrophoneEnabled(false)
						.then(() => {
							// Set the initial mic status to IDLE
							this.store.setMicState(MicState.IDLE)
						})
						.catch(() => {
							this.store.setMicState(MicState.NOT_ALLOWED)
						})
				} catch (e) {
					console.error(e)
					this.store.setMicState(MicState.ERROR)
				} finally {
					this.store.setPageState(RequestState.READY)
				}
			})
			.catch((err) => {
				this.store.setMicState(MicState.ERROR)
				console.error({ err })
			})
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
