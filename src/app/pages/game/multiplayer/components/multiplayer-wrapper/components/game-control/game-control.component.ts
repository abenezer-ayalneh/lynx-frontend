import { NgClass } from '@angular/common'
import { AfterViewInit, Component, computed, HostListener, inject, input, OnDestroy, OnInit, viewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { Router } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Participant, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room as LiveKitRoom, RoomEvent, Track, TrackPublication } from 'livekit-client'
import { firstValueFrom } from 'rxjs'

import { environment } from '../../../../../../../../environments/environment'
import { RequestPermissionComponent } from '../../../../../../../shared/components/request-permission/request-permission.component'
import { ColyseusService } from '../../../../../../../shared/services/colyseus.service'
import { LiveKitService } from '../../../../../../../shared/services/live-kit.service'
import { PlayerService } from '../../../../../../../shared/services/player.service'
import { SnackbarService } from '../../../../../../../shared/services/snackbar.service'
import { GamePlayStatus, GameState } from '../../../../../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../../../../../shared/types/page-state.type'
import { MultiplayerStore } from '../../../../../../../states/stores/multiplayer.store'
import { MicState } from '../../../../types/mic-state.type'

@Component({
	selector: 'app-game-control',
	imports: [FaIconComponent, MatTooltip, NgClass],
	templateUrl: './game-control.component.html',
	styleUrl: './game-control.component.scss',
})
export class GameControlComponent implements OnInit, AfterViewInit, OnDestroy {
	readonly store = inject(MultiplayerStore)

	scheduledGameId = input.required<string>()

	sessionId = input.required<string>()

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

	private liveKitEventHandlers: {
		event: RoomEvent
		handler: (...args: unknown[]) => void
	}[] = []

	protected readonly MicState = MicState

	protected readonly GamePlayStatus = GamePlayStatus

	constructor(
		private readonly matDialog: MatDialog,
		private readonly snackbarService: SnackbarService,
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
		private readonly playerService: PlayerService,
		private readonly liveKitService: LiveKitService,
	) {}

	async ngOnInit() {
		await this.initiateVoiceChat(this.scheduledGameId(), this.sessionId())
	}

	ngAfterViewInit() {
		this.tooltip().show(500)
	}

	async ngOnDestroy() {
		await this.leaveLiveKitRoom()
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
			// Enables the microphone and publishes it to a new audio-participant track
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

	private async initiateVoiceChat(gameId: string, sessionId: string) {
		const room = new LiveKitRoom()
		this.store.setLiveKitRoom(room)

		// Specify the actions when events take place in the room
		// On every new Track received...
		const trackSubscribedHandler = (remoteTrack: RemoteTrack, remotePublication: RemoteTrackPublication, remoteParticipant: RemoteParticipant) => {
			this.store.addRemoteTrack(remoteParticipant.identity, remotePublication, remoteTrack.isMuted)
		}
		room.on(RoomEvent.TrackSubscribed, trackSubscribedHandler)
		this.liveKitEventHandlers.push({ event: RoomEvent.TrackSubscribed, handler: trackSubscribedHandler as (...args: unknown[]) => void })

		// On every new Track destroyed...
		const trackUnsubscribedHandler = (_remoteTrack: RemoteTrack, _remotePublication: RemoteTrackPublication, remoteParticipant: RemoteParticipant) => {
			this.store.deleteRemoteTrack(remoteParticipant.identity)
		}
		room.on(RoomEvent.TrackUnsubscribed, trackUnsubscribedHandler)
		this.liveKitEventHandlers.push({ event: RoomEvent.TrackUnsubscribed, handler: trackUnsubscribedHandler as (...args: unknown[]) => void })

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
			const trackMutedHandler = (trackPublication: TrackPublication, participant: Participant) => {
				this.store.changePlayerMuteState(participant.identity, trackPublication.isMuted)
			}
			room.on(RoomEvent.TrackMuted, trackMutedHandler)
			this.liveKitEventHandlers.push({ event: RoomEvent.TrackMuted, handler: trackMutedHandler as (...args: unknown[]) => void })

			// This will fire when any track is unmuted.
			const trackUnmutedHandler = (trackPublication: TrackPublication, participant: Participant) => {
				this.store.changePlayerMuteState(participant.identity, trackPublication.isMuted)
			}
			room.on(RoomEvent.TrackUnmuted, trackUnmutedHandler)
			this.liveKitEventHandlers.push({ event: RoomEvent.TrackUnmuted, handler: trackUnmutedHandler as (...args: unknown[]) => void })

			// This event will fire with a list of participants who are actively speaking.
			const activeSpeakersChangedHandler = (participants: Participant[]) => {
				this.store.changePlayerSpeakingState(
					participants.map((participant) => ({
						id: participant.identity,
						speaking: participant.isSpeaking,
						audioLevel: participant.audioLevel,
					})),
				)
			}
			room.on(RoomEvent.ActiveSpeakersChanged, activeSpeakersChangedHandler)
			this.liveKitEventHandlers.push({ event: RoomEvent.ActiveSpeakersChanged, handler: activeSpeakersChangedHandler as (...args: unknown[]) => void })

			// When the audio-participant playback status is changed, this event will fire.
			// And I use it to resume the audio-participant playback.
			const audioPlaybackStatusChangedHandler = (status: boolean) => {
				if (status) {
					room.startAudio()
				}
			}
			room.on(RoomEvent.AudioPlaybackStatusChanged, audioPlaybackStatusChangedHandler)
			this.liveKitEventHandlers.push({
				event: RoomEvent.AudioPlaybackStatusChanged,
				handler: audioPlaybackStatusChangedHandler as (...args: unknown[]) => void,
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
		const room = this.store.liveKitRoom()
		if (room) {
			// Remove all event listeners before disconnecting
			for (const { event, handler } of this.liveKitEventHandlers) {
				room.off(event, handler)
			}
			this.liveKitEventHandlers = []

			// Leave the room by calling the 'disconnect' method over the Room object.
			await room.disconnect()
		}

		// Reset all variables
		this.store.setLiveKitRoom(undefined)
		this.store.setLocalTrack(undefined)
		this.store.clearRemoteTracks()
	}
}
