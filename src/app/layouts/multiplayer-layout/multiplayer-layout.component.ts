import { NgClass } from '@angular/common'
import { AfterViewInit, Component, computed, HostListener, inject, OnInit, viewChild, ViewEncapsulation } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room as LiveKitRoom, RoomEvent, Track } from 'livekit-client'
import { firstValueFrom } from 'rxjs'

import { environment } from '../../../environments/environment'
import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { RequestPermissionComponent } from '../../shared/components/request-permission/request-permission.component'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { SnackbarService } from '../../shared/services/snackbar.service'
import { GameStatus } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'

@Component({
	selector: 'app-multiplayer-layout',
	imports: [RouterOutlet, FaIconComponent, MatTooltip, NgClass, LoadingComponent],
	templateUrl: './multiplayer-layout.component.html',
	styleUrl: './multiplayer-layout.component.scss',
	providers: [MultiplayerStore],
	encapsulation: ViewEncapsulation.None,
})
export class MultiplayerLayoutComponent implements OnInit, AfterViewInit {
	isPlayerGameOwner = computed(() => true) //TODO: get this value from the game-room state

	tooltip = viewChild.required<MatTooltip>('tooltip')

	readonly store = inject(MultiplayerStore)

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash, faTimes, faExclamation, faPause, faPlay }

	protected readonly MicState = MicState

	protected readonly RequestState = RequestState

	protected readonly GameStatus = GameStatus

	constructor(
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
		private readonly matDialog: MatDialog,
		private readonly snackbarService: SnackbarService,
		private readonly activatedRoute: ActivatedRoute,
	) {}

	get getMicButtonTooltip() {
		switch (this.store.micState()) {
			case MicState.ON:
				return 'Turn off microphone (CTRL + m)'
			case MicState.MUTED:
				return 'Turn on microphone (CTRL + m)'
			default:
				return 'Enable microphone for people in the game to hear your voice.'
		}
	}

	ngOnInit() {
		this.initiateVoiceChat()
	}

	ngAfterViewInit() {
		this.tooltip().show(500)
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadConfirmation(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	@HostListener('window:click')
	onClick() {
		if (this.tooltip()._isTooltipVisible()) {
			this.tooltip().hide()
		}
	}

	@HostListener('window:keydown.control.m')
	async toggleMic() {
		const micState = this.store.micState()
		const isMicEnabled = this.store.liveKitRoom()?.localParticipant?.isMicrophoneEnabled
		const micTrackPublication = this.store.liveKitRoom()?.localParticipant?.getTrackPublication(Track.Source.Microphone)

		if (isMicEnabled !== undefined && micTrackPublication) {
			if (micState === MicState.ON) {
				micTrackPublication.mute().then(() => this.store.setMicState(MicState.MUTED))
			} else if (micState === MicState.MUTED) {
				micTrackPublication.unmute().then(() => this.store.setMicState(MicState.ON))
			}
		}
		// Ask for permission
		else if (this.store.liveKitRoom() && MicState.NOT_ALLOWED) {
			this.store.setMicState(MicState.LOADING)

			const room = this.store.liveKitRoom()
			// Enables the microphone and publishes it to a new audio track
			room?.localParticipant
				.setMicrophoneEnabled(true)
				.then(() => {
					// Set initial mic status
					if (room.localParticipant.isMicrophoneEnabled) {
						this.store.setMicState(MicState.ON)
					} else {
						this.store.setMicState(MicState.MUTED)
					}
				})
				.catch(() => {
					this.store.setMicState(MicState.NOT_ALLOWED)
					this.matDialog.open(RequestPermissionComponent, {
						height: '400px',
						width: '600px',
					})
				})
		} else if (micState === MicState.ERROR) {
			this.snackbarService.showSnackbar('Error: communication server failed! Reload page to retry.')
		}
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	async exitGame() {
		await this.router.navigate(['/'])
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	toggleGameStatus() {
		if (this.store.gameStatus() === GameStatus.ONGOING) {
			this.colyseusService.pauseGame()
			this.store.pauseGame()
		} else if (this.store.gameStatus() === GameStatus.PAUSED) {
			this.colyseusService.resumeGame()
			this.store.resumeGame()
		}
	}

	private initiateVoiceChat() {
		const gameId = this.activatedRoute.snapshot.paramMap.get('gameId')

		if (gameId) {
			firstValueFrom(this.store.liveKitService.getToken(gameId))
				.then(async ({ token }) => {
					try {
						const room = new LiveKitRoom()
						await room.connect(environment.liveKitServerUrl, token)

						this.store.setLiveKitRoom(room)

						room.on(RoomEvent.TrackSubscribed, (track) => track.attach())

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
		} else {
			this.store.setPageState(RequestState.ERROR)
		}
	}
}
