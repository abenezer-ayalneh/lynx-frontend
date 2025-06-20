import { Component, computed, effect, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { ButtonComponent } from '../../shared/components/button/button.component'
import { START_GAME } from '../../shared/constants/colyseus-message.constant'
import { PlayerService } from '../../shared/services/player.service'
import { startCountdown } from '../../shared/utils/timer.util'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'

@Component({
	selector: 'app-lobby',
	imports: [ReactiveFormsModule, ButtonComponent],
	templateUrl: './lobby.component.html',
	styleUrl: './lobby.component.scss',
})
export class LobbyComponent {
	readonly store = inject(MultiplayerStore)

	seconds = signal<number>(NaN)

	minutes = signal<number>(NaN)

	hours = signal<number>(NaN)

	days = signal<number>(NaN)

	countdownEnded = signal<boolean>(false)

	isGameOwner = computed(() => this.store.ownerId() === this.playerService.getPlayer.getValue()?.id)

	icons = { faTimesCircle }

	error: string | null = null

	protected readonly isNaN = isNaN

	constructor(private readonly playerService: PlayerService) {
		effect(() => {
			const startTime = this.store.startTime()

			if (startTime) {
				this.initiateCountdown()
			}
		})
	}

	initiateCountdown(): void {
		startCountdown(new Date(this.store.startTime())).subscribe({
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
	}

	startGame() {
		this.store.colyseusRoom()?.send(START_GAME, { playerId: this.playerService.getPlayer.getValue()?.id })
	}
}
