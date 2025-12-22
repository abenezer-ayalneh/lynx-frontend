import { Component, computed, inject, OnDestroy } from '@angular/core'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { GamePlayComponent } from '../../../shared/components/game-play/game-play.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { START_NEW_GAME } from '../../../shared/constants/colyseus-message.constant'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { PlayerService } from '../../../shared/services/player.service'
import { GameType } from '../../../shared/types/game.type'
import { GamePlayStatus, GameState } from '../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../shared/types/page-state.type'
import { MultiplayerStore } from '../../../states/stores/multiplayer.store'
import { MultiplayerService } from './multiplayer.service'

@Component({
	selector: 'app-multiplayer',
	imports: [GameStartComponent, RoundResultComponent, GameEndComponent, GamePlayComponent, FaIconComponent],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements OnDestroy {
	readonly store = inject(MultiplayerStore)

	isPlayerGameOwner = computed(() => this.store.ownerId() === this.playerService.getPlayer.getValue()?.id)

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash, faTimes, faExclamation, faPause, faPlay }

	protected readonly PageState = RequestState

	protected readonly GameType = GameType

	protected readonly GamePlayStatus = GamePlayStatus

	protected readonly GameState = GameState

	constructor(
		private readonly playerService: PlayerService,
		private readonly multiplayerService: MultiplayerService,
		protected readonly colyseusService: ColyseusService,
	) {}

	ngOnDestroy(): void {
		this.colyseusService.leaveRoom()
		this.multiplayerService.sessionScore.set(undefined)
	}

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.room?.sessionId ?? '') ?? 0
	}

	startNewGame() {
		if (this.playerService.getPlayer.getValue()?.id && this.store.scheduledGame()?.id) {
			this.colyseusService.room?.send(START_NEW_GAME, {
				scheduledGameId: this.store.scheduledGame()?.id,
				ownerId: this.playerService.getPlayer.getValue()?.id,
			})
		}
	}
}
