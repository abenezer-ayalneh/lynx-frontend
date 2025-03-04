import { Component, input, OnInit } from '@angular/core'
import { HighlightKeyPipe } from '../../highlight-key.pipe'
import { Word } from '../../types/word.type'
import { NgClass } from '@angular/common'

@Component({
	selector: 'app-round-result',
	imports: [HighlightKeyPipe, NgClass],
	templateUrl: './round-result.component.html',
	styleUrl: './round-result.component.scss',
})
export class RoundResultComponent implements OnInit {
	winner = input.required<boolean>()

	word = input<Word>()

	score = input.required<number>()

	waitingCountdownTime = input.required<number>()

	allFailRoundAudio = new Audio()

	solvedRoundAudio = new Audio()

	constructor() {
		this.allFailRoundAudio.src = 'audios/trumpet-all-fail-round.mp3'
		this.solvedRoundAudio.src = 'audios/trumpet-solved-round.mp3'
	}

	ngOnInit(): void {
		if (this.winner()) {
			this.solvedRoundAudio.play()
		} else {
			this.allFailRoundAudio.play()
		}
	}
}
