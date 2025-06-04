import { NgClass } from '@angular/common'
import { AfterViewInit, Component, effect, HostListener, OnDestroy, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { ActivatedRoute } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room as LiveKitRoom, RoomEvent, Track } from 'livekit-client'
import { Subscription } from 'rxjs'

import { environment } from '../../../../environments/environment'
import { CloseGameDialogComponent } from '../../../shared/components/close-game-dialog/close-game-dialog.component'
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

	room: LiveKitRoom | null = null

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
		this.room?.disconnect(true)
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

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.room?.sessionId ?? '') ?? 0
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadConfirmation(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	@HostListener('window:popstate', ['$event'])
	onPopState(event: PopStateEvent) {
		//Here you can handle your modal
		event.preventDefault()
		event.stopPropagation()
		event.stopImmediatePropagation()
		event.returnValue = false // For legacy compatability
	}

	@HostListener('window:keydown.control.m')
	toggleMic() {
		const micStatus = this.room?.localParticipant?.isMicrophoneEnabled
		const micTrackPublication = this.room?.localParticipant?.getTrackPublication(Track.Source.Microphone)

		if (micStatus !== undefined && micTrackPublication) {
			const mic = this.micState()
			if (mic === MicState.ON) {
				micTrackPublication.mute().then(() => this.micState.set(MicState.MUTED))
			} else if (mic === MicState.MUTED) {
				micTrackPublication.unmute().then(() => this.micState.set(MicState.ON))
			}
		}
		// Ask for permission
		else if (this.room && MicState.NOT_ALLOWED) {
			const room = this.room
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
		} else if (this.micState() === MicState.ERROR) {
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
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
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
					this.room = room
					room.on(RoomEvent.TrackSubscribed, (track) => track.attach())
					// Enables the microphone and publishes it to a new audio track
					room.localParticipant
						.setMicrophoneEnabled(true)
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
