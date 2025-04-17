import { Component, input, OnInit } from '@angular/core'
import { HighlightKeyPipe } from '../../pipes/highlight-key.pipe'
import { Word } from '../../types/word.type'
import { NgClass } from '@angular/common'
import { Score } from '../../types/winner.type'
import { ColyseusService } from '../../services/colyseus.service'
import { GameType } from '../../types/game.type'

@Component({
	selector: 'app-round-result',
	imports: [HighlightKeyPipe, NgClass],
	templateUrl: './round-result.component.html',
	styleUrl: './round-result.component.scss',
})
export class RoundResultComponent implements OnInit {
	winner = input.required<Score | null>()

	word = input<Word>()

	score = input.required<number>()

	waitingCountdownTime = input.required<number>()

	gameType = input.required<GameType>()

	allFailRoundAudio = new Audio()

	solvedRoundAudio = new Audio()

	constructor(protected readonly colyseusService: ColyseusService) {
		this.allFailRoundAudio.src = 'audios/failed-round.mp3'
		this.allFailRoundAudio.volume = 0.2
		this.solvedRoundAudio.src = 'audios/solved-round.mp3'
		this.solvedRoundAudio.volume = 0.2
	}

	/**
	 * Check if the current player is the winner
	 */
	get isPlayerTheWinner() {
		return this.colyseusService.room?.sessionId === this.winner()?.id
	}

	get cuesToShow() {
		return this.word()?.cues.filter((cue) => cue.shown)
	}

	ngOnInit(): void {
		if (this.isPlayerTheWinner) {
			this.solvedRoundAudio.play()
		} else {
			this.allFailRoundAudio.play()
		}
	}

	protected readonly GameType = GameType
}
