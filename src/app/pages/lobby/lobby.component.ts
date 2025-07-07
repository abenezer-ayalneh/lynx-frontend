import { Component, computed, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { ButtonComponent } from '../../shared/components/button/button.component'
import { GameStartCountdownComponent } from '../../shared/components/game-start-countdown/game-start-countdown.component'
import { START_GAME } from '../../shared/constants/colyseus-message.constant'
import { PlayerService } from '../../shared/services/player.service'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'

@Component({
	selector: 'app-lobby',
	imports: [ReactiveFormsModule, ButtonComponent, GameStartCountdownComponent],
	templateUrl: './lobby.component.html',
	styleUrl: './lobby.component.scss',
})
export class LobbyComponent {
	readonly store = inject(MultiplayerStore)

	countdownEnded = signal<boolean>(false)

	isGameOwner = computed(() => this.store.ownerId() === this.playerService.getPlayer.getValue()?.id)

	icons = { faTimesCircle }

	error: string | null = null

	protected readonly isNaN = isNaN

	constructor(private readonly playerService: PlayerService) {}

	startGame() {
		if (this.playerService.getPlayer.getValue()?.id && this.store.scheduledGame()?.id) {
			this.store
				.colyseusRoom()
				?.send(START_GAME, { ownerId: this.playerService.getPlayer.getValue()?.id, scheduledGameId: this.store.scheduledGame()?.id })
		}
	}
}
