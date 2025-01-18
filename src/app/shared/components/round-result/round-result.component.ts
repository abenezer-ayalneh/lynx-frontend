import { Component, input } from '@angular/core'
import { HighlightKeyPipe } from '../../highlight-key.pipe'
import { Word } from '../../types/word.type'

@Component({
	selector: 'app-round-result',
	imports: [HighlightKeyPipe],
	templateUrl: './round-result.component.html',
	styleUrl: './round-result.component.scss',
})
export class RoundResultComponent {
	winner = input.required<boolean>()

	word = input<Word>()

	score = input.required<number>()

	waitingCountdownTime = input.required<number>()
}
