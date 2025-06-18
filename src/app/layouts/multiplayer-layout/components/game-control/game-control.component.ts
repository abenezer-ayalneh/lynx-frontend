import { NgClass } from '@angular/common'
import { AfterViewInit, Component, computed, HostListener, inject, viewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { Router } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Track } from 'livekit-client'

import { MicState } from '../../../../pages/game/multiplayer/types/mic-state.type'
import { RequestPermissionComponent } from '../../../../shared/components/request-permission/request-permission.component'
import { ColyseusService } from '../../../../shared/services/colyseus.service'
import { PlayerService } from '../../../../shared/services/player.service'
import { SnackbarService } from '../../../../shared/services/snackbar.service'
import { GamePlayStatus, GameState } from '../../../../shared/types/multiplayer-room-state.type'
import { MultiplayerStore } from '../../../../states/stores/multiplayer.store'

@Component({
	selector: 'app-game-control',
	imports: [FaIconComponent, MatTooltip, NgClass],
	templateUrl: './game-control.component.html',
	styleUrl: './game-control.component.scss',
})
export class GameControlComponent implements AfterViewInit {
	readonly store = inject(MultiplayerStore)

	showGamePlayButton = computed(() => this.store.ownerId() === this.playerService.getPlayer.getValue()?.id && this.store.gameState() !== GameState.LOBBY)

	micButtonTooltip = computed(() => {
		switch (this.store.micState()) {
			case MicState.ON:
				return 'Turn off microphone (CTRL + m)'
			case MicState.MUTED:
				return 'Turn on microphone (CTRL + m)'
			default:
				return 'Enable microphone for people in the game to hear your voice.'
		}
	})

	tooltip = viewChild.required<MatTooltip>('tooltip')

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash, faTimes, faExclamation, faPause, faPlay }

	protected readonly MicState = MicState

	protected readonly GamePlayStatus = GamePlayStatus

	constructor(
		private readonly matDialog: MatDialog,
		private readonly snackbarService: SnackbarService,
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
		private readonly playerService: PlayerService,
	) {}

	ngAfterViewInit() {
		this.tooltip().show(500)
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
	toggleGamePlayStatus() {
		if (this.store.gamePlayStatus() === GamePlayStatus.PLAYING) {
			this.colyseusService.pauseGame()
			this.store.pauseGame()
		} else if (this.store.gamePlayStatus() === GamePlayStatus.PAUSED) {
			this.colyseusService.resumeGame()
			this.store.resumeGame()
		}
	}
}
