import { Component, computed, inject, OnDestroy,signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { ButtonComponent } from '../../shared/components/button/button.component'
import { GameStartCountdownComponent } from '../../shared/components/game-start-countdown/game-start-countdown.component'
import { START_GAME } from '../../shared/constants/colyseus-message.constant'
import { PlayerService } from '../../shared/services/player.service'
import { MultiplayerStore } from '../../states/stores/multiplayer.store'
import { MultiplayerService } from '../game/multiplayer/multiplayer.service'

@Component({
	selector: 'app-lobby',
	imports: [ReactiveFormsModule, ButtonComponent, GameStartCountdownComponent],
	templateUrl: './lobby.component.html',
	styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnDestroy {
	readonly store = inject(MultiplayerStore)

	countdownEnded = signal<boolean>(false)

	isGameOwner = computed(() => this.store.ownerId() === this.playerService.getPlayer.getValue()?.id)

	icons = { faTimesCircle }

	error: string | null = null

	constructor(
		private readonly playerService: PlayerService,
		private readonly multiplayerService: MultiplayerService,
	) {}

	ngOnDestroy(): void {
		this.multiplayerService.sessionScore.set(undefined)
	}

	startGame() {
		if (this.playerService.getPlayer.getValue()?.id && this.store.scheduledGame()?.id) {
			this.store
				.colyseusRoom()
				?.send(START_GAME, { ownerId: this.playerService.getPlayer.getValue()?.id, scheduledGameId: this.store.scheduledGame()?.id })
		}
	}
}
