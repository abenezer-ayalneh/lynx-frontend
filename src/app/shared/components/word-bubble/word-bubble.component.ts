import { Component, computed, input } from '@angular/core'

import { Cue } from '../../types/word.type'

@Component({
	selector: 'app-word-bubble',
	imports: [],
	templateUrl: './word-bubble.component.html',
	styleUrl: './word-bubble.component.scss',
})
export class WordBubbleComponent {
	cue = input.required<Cue>()

	key = input.required<string | undefined>()

	word = computed(() => this.cue().word.replace(this.key() ?? '', ''))
}
