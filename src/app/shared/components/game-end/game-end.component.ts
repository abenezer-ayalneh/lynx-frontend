import { Component, input, OnInit, output } from '@angular/core'
import { ButtonComponent } from '../button/button.component'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { MatTooltip } from '@angular/material/tooltip'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { CloseGameDialogComponent } from '../close-game-dialog/close-game-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { Score } from '../../types/winner.type'
import { ColyseusService } from '../../services/colyseus.service'
import { PlayerService } from '../../services/player.service'
import { GameType } from '../../types/game.type'

@Component({
	selector: 'app-game-end',
	imports: [ButtonComponent, FaIconComponent, MatTooltip],
	templateUrl: './game-end.component.html',
	styleUrl: './game-end.component.scss',
})
export class GameEndComponent implements OnInit {
	totalScore = input.required<Map<string, Score>>()

	shouldShowRestartGameButton = input<boolean>(true)

	gameType = input.required<GameType>()

	playNewGameClicked = output()

	icons = { faTimesCircle }

	endOfGameAudio = new Audio()

	protected readonly GameType = GameType

	constructor(
		private readonly matDialog: MatDialog,
		private readonly colyseusService: ColyseusService,
		private readonly playerService: PlayerService,
	) {
		this.endOfGameAudio.src = 'audios/end-of-game-results.mp3'
		this.endOfGameAudio.volume = 0.25
	}

	get myTotalScore() {
		return this.getPlayerTotalScore(this.totalScore())?.score ?? 0
	}

	get rankedScores() {
		return Array.from(this.totalScore().values()).sort((a, b) => b.score - a.score)
	}

	ngOnInit() {
		this.endOfGameAudio.play()
	}

	/**
	 * Start a new game
	 */
	playNewGame() {
		this.playNewGameClicked.emit()
	}

	/**
	 * Exit the currently being played solo game
	 */
	exitSoloPlay() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}

	private getPlayerTotalScore(totalScores: Map<string, Score> | number) {
		if (typeof totalScores === 'number') {
			return {
				id: '',
				name: this.playerService.getPlayer.getValue()?.name,
				score: totalScores,
			} as Score
		}

		return totalScores.get(this.colyseusService.room?.sessionId ?? '') ?? null
	}
}
