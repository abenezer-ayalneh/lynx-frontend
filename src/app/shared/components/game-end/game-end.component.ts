import { Component, computed, input, OnInit, output } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { ColyseusService } from '../../services/colyseus.service'
import { PlayerService } from '../../services/player.service'
import { GameType } from '../../types/game.type'
import { RestartGameVote } from '../../types/restart-game-vote.type'
import { Score } from '../../types/winner.type'
import { ButtonComponent } from '../button/button.component'
import { CloseGameDialogComponent } from '../close-game-dialog/close-game-dialog.component'

@Component({
	selector: 'app-game-end',
	imports: [ButtonComponent, FaIconComponent, MatTooltip],
	templateUrl: './game-end.component.html',
	styleUrl: './game-end.component.scss',
})
export class GameEndComponent implements OnInit {
	totalScore = input.required<Map<string, Score>>()

	gameType = input.required<GameType>()

	votes = input<Map<string, RestartGameVote>>()

	shouldShowRestartGameButton = input<boolean>(true)

	rankedScores = computed(() => Array.from(this.totalScore().values()).sort((a, b) => b.score - a.score))

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
		this.endOfGameAudio.volume = 0.2
	}

	get myTotalScore() {
		return this.getPlayerTotalScore(this.totalScore())?.score ?? 0
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
	 * Exit the currently being played game
	 */
	exitGame() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}

	/**
	 * Sends a vote for restarting the game to the server.
	 *
	 * @param {boolean} vote - Indicates whether the user votes to restart the game (true) or not (false).
	 * @return {void} Does not return a value.
	 */
	voteForGameRestart(vote: boolean): void {
		this.colyseusService.room?.send('game-restart-vote', { vote })
	}

	/**
	 * Disables the "Play New Game" button based on the current votes and total score.
	 *
	 * @param {Map<string, RestartGameVote> | undefined} votes - A map containing the votes for restarting the game. The key is the session ID, and the value is a RestartGameVote object.
	 * @return {boolean} Returns true if the button should be disabled, otherwise false.
	 */
	disablePlayNewGameButton(votes: Map<string, RestartGameVote> | undefined): boolean {
		if (votes) {
			console.log({ logic: votes.size < this.totalScore().size - 1, votesSize: votes?.size, totalScoreSize: this.totalScore().size })
			return votes.size < this.totalScore().size - 1
		}

		return false
	}

	/**
	 * Calculates and retrieves the total score of a player based on the provided data.
	 *
	 * @param {Map<string, Score> | number} totalScores - A map of player scores with their session IDs as keys and a `Score` object as value.
	 * @return {Score | null} The total score object of the player, or null if not found in the map.
	 */
	private getPlayerTotalScore(totalScores: Map<string, Score> | number): Score | null {
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
