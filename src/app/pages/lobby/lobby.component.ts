import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { startCountdown } from '../../shared/utils/timer.util'
import { LobbyRoomState } from './types/lobby-room-state.type'

@Component({
	selector: 'app-lobby',
	imports: [LoadingComponent],
	templateUrl: './lobby.component.html',
	styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit {
	loaded = signal<boolean>(false)

	seconds = signal<number>(0)

	minutes = signal<number>(0)

	hours = signal<number>(0)

	days = signal<number>(0)

	countdownEnded = signal<boolean>(false)

	icons = { faTimesCircle }

	error: string | null = null

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly colyseusService: ColyseusService,
	) {}

	ngOnInit() {
		const roomId = this.activatedRoute.snapshot.queryParams['id']

		// Join a websocket room with the gameId
		if (roomId) {
			this.colyseusService.getClient
				.joinById<LobbyRoomState>(roomId)
				.then((room) => {
					room.onStateChange.once((lobbyState) => {
						startCountdown(new Date(lobbyState.startTime)).subscribe({
							next: ({ days, hours, minutes, seconds }) => {
								this.days.set(days)
								this.hours.set(hours)
								this.minutes.set(minutes)
								this.seconds.set(seconds)
							},
							complete: () => {
								this.countdownEnded.set(true)
							},
						})
					})
					this.loaded.set(true)
				})
				.catch((e) => {
					this.error = 'Error joining room'
					this.loaded.set(true)
					console.error(e)
				})
		} else {
			this.error = 'No room id provided'
			this.loaded.set(true)
		}
	}
}
