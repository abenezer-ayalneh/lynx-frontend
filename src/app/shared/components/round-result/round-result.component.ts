import { Component, input, OnInit } from '@angular/core'
import { HighlightKeyPipe } from '../../highlight-key.pipe'
import { Word } from '../../types/word.type'
import { NgClass } from '@angular/common'
import { Winner } from '../../types/winner.type'
import { ColyseusService } from '../../services/colyseus.service'

@Component({
	selector: 'app-round-result',
	imports: [HighlightKeyPipe, NgClass],
	templateUrl: './round-result.component.html',
	styleUrl: './round-result.component.scss',
})
export class RoundResultComponent implements OnInit {
	winner = input.required<Winner>()

	word = input<Word>()

	score = input.required<number>()

	waitingCountdownTime = input.required<number>()

	allFailRoundAudio = new Audio()

	solvedRoundAudio = new Audio()

	constructor(protected readonly colyseusService: ColyseusService) {
		this.allFailRoundAudio.src = 'audios/trumpet-all-fail-round.mp3'
		this.solvedRoundAudio.src = 'audios/trumpet-solved-round.mp3'
	}

	/**
	 * Check if the current player is the winner
	 */
	get isPlayerTheWinner() {
		return this.colyseusService.room?.sessionId === this.winner()?.id
	}

	ngOnInit(): void {
		if (this.isPlayerTheWinner) {
			this.solvedRoundAudio.play()
		} else {
			this.allFailRoundAudio.play()
		}
	}
}
