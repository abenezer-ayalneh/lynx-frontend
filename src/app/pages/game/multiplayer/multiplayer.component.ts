import { NgClass } from '@angular/common'
import { AfterViewInit, Component, effect, HostListener, OnDestroy, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { ActivatedRoute, Router } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room as LiveKitRoom, RoomEvent, Track } from 'livekit-client'
import { Subscription } from 'rxjs'

import { environment } from '../../../../environments/environment'
import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { GamePlayComponent } from '../../../shared/components/game-play/game-play.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { RequestPermissionComponent } from '../../../shared/components/request-permission/request-permission.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { LiveKitService } from '../../../shared/services/live-kit.service'
import { PlayerService } from '../../../shared/services/player.service'
import { SnackbarService } from '../../../shared/services/snackbar.service'
import { GameType } from '../../../shared/types/game.type'
import { MultiplayerRoomState } from '../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../shared/types/page-state.type'
import { MultiplayerService } from './multiplayer.service'
import { MicState } from './types/mic-state.type'

@Component({
	selector: 'app-multiplayer',
	imports: [
		ErrorWhileLoadingComponent,
		GameStartComponent,
		RoundResultComponent,
		GameEndComponent,
		LoadingComponent,
		GamePlayComponent,
		FaIconComponent,
		MatTooltip,
		NgClass,
	],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements AfterViewInit, OnDestroy {
	subscriptions$ = new Subscription()

	roomState = signal<MultiplayerRoomState | null>(null)

	pageState = signal<RequestState>(RequestState.READY)

	micState = signal<MicState>(MicState.LOADING)

	liveKitRoom: LiveKitRoom | null = null

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash, faTimes, faExclamation, faPause, faPlay }

	protected readonly PageState = RequestState

	protected readonly GameType = GameType

	protected readonly MicState = MicState

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly multiplayerService: MultiplayerService,
		private readonly matDialog: MatDialog,
		private readonly liveKitService: LiveKitService,
		private readonly snackbarService: SnackbarService,
		private readonly router: Router,
		protected readonly colyseusService: ColyseusService,
	) {
		effect(() => {
			const roomState = this.roomState()
			if (roomState) {
				if (this.colyseusService.room?.sessionId && roomState.sessionScore.has(this.colyseusService.room?.sessionId)) {
					this.multiplayerService.sessionScore.set(roomState.sessionScore.get(this.colyseusService.room.sessionId))
				}
			}
		})
	}

	ngAfterViewInit() {
		this.joinMultiplayerGame()
	}

	ngOnDestroy() {
		this.colyseusService.leaveRoom()
		this.liveKitRoom?.disconnect(true)
		this.subscriptions$.unsubscribe()
		this.multiplayerService.sessionScore.set(undefined)
	}

	joinMultiplayerGame() {
		const roomId = this.activatedRoute.snapshot.params['roomId']
		const name = this.activatedRoute.snapshot.queryParams['name']

		// Join a websocket room with the gameId
		if (roomId && name) {
			this.colyseusService.getClient.auth.token = name
			this.colyseusService.getClient
				.joinById<MultiplayerRoomState>(roomId)
				.then((room) => {
					this.colyseusService.setRoom = room
					// this.subscribeToColyseusMessages(room)
					this.initiateVoiceChat(room.roomId, room.sessionId)
					sessionStorage.setItem('reconnectionToken', room.reconnectionToken)

					room.onStateChange((state) => this.roomState.set({ ...state }))
					this.pageState.set(RequestState.READY)
				})
				.catch((e) => {
					this.error = 'Error joining room'
					this.pageState.set(RequestState.ERROR)
					console.error(e)
				})
		} else {
			this.error = 'No room id provided'
			this.pageState.set(RequestState.READY)
		}
	}

	reconnect() {
		const reconnectionToken = sessionStorage.getItem('reconnectionToken')
		if (reconnectionToken && this.colyseusService.getClient) {
			this.colyseusService.getClient
				.reconnect<MultiplayerRoomState>(reconnectionToken)
				.then((room) => (this.colyseusService.setRoom = room))
				.catch((error) => console.error('join error', error))
		}
	}

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.room?.sessionId ?? '') ?? 0
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadConfirmation(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	@HostListener('window:keydown.control.m')
	async toggleMic() {
		const micState = this.micState()
		const isMicEnabled = this.liveKitRoom?.localParticipant?.isMicrophoneEnabled
		const micTrackPublication = this.liveKitRoom?.localParticipant?.getTrackPublication(Track.Source.Microphone)

		if (isMicEnabled !== undefined && micTrackPublication) {
			if (micState === MicState.ON) {
				micTrackPublication.mute().then(() => this.micState.set(MicState.MUTED))
			} else if (micState === MicState.MUTED) {
				micTrackPublication.unmute().then(() => this.micState.set(MicState.ON))
			}
		}
		// Ask for permission
		else if (this.liveKitRoom && MicState.NOT_ALLOWED) {
			this.micState.set(MicState.LOADING)
			await new Promise((resolve) => setTimeout(resolve, 3000))
			const room = this.liveKitRoom
			// Enables the microphone and publishes it to a new audio track
			room.localParticipant
				.setMicrophoneEnabled(true)
				.then(() => {
					// Set initial mic status
					this.micState.set(room.localParticipant.isMicrophoneEnabled ? MicState.ON : MicState.MUTED)
				})
				.catch(() => {
					this.micState.set(MicState.NOT_ALLOWED)
					this.matDialog.open(RequestPermissionComponent, {
						height: '400px',
						width: '600px',
					})
				})
		} else if (micState === MicState.ERROR) {
			this.snackbarService.showSnackbar('Error: communication server failed! Reload page to retry.')
		}
	}

	startNewGame() {
		this.colyseusService.room?.send('start-new-game')
	}

	isPlayerGameOwner() {
		return this.roomState()?.ownerId === this.playerService.getPlayer.getValue()?.id
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	exitGame() {
		this.router.navigate(['/'])
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	toggleGameStatus() {
		if (this.roomState()?.gameStatus === 'ONGOING') {
			this.colyseusService.pauseGame()
		} else if (this.roomState()?.gameStatus === 'PAUSED') {
			this.colyseusService.resumeGame()
		}
	}

	getMicButtonTooltip() {
		switch (this.micState()) {
			case MicState.ON:
				return 'Turn off microphone (CTRL + m)'
			case MicState.MUTED:
				return 'Turn on microphone (CTRL + m)'
			default:
				return ''
		}
	}

	private initiateVoiceChat(colyseusRoomId: string, sessionId: string) {
		this.liveKitService.getToken(colyseusRoomId, sessionId).subscribe({
			next: async ({ token }) => {
				try {
					const room = new LiveKitRoom()
					await room.connect(environment.liveKitServerUrl, token)
					this.liveKitRoom = room
					room.on(RoomEvent.TrackSubscribed, (track) => track.attach())

					// Enables the microphone and publishes it to a new audio track
					// NOTE: it is intentional that I am passing `false` for the `setMicrophoneEnabled` method.
					// This is because an interaction is needed for the audio stream to be attached and be able to play.
					// For more info check: https://developer.chrome.com/blog/autoplay/#web_audio
					room.localParticipant
						.setMicrophoneEnabled(false)
						.then(() => {
							// Set initial mic status
							this.micState.set(room.localParticipant.isMicrophoneEnabled ? MicState.ON : MicState.MUTED)
						})
						.catch(() => {
							this.micState.set(MicState.NOT_ALLOWED)
						})
				} catch (e) {
					console.error(e)
					this.micState.set(MicState.ERROR)
				}
			},
			error: (err) => {
				console.error({ err })
			},
		})
	}
}
