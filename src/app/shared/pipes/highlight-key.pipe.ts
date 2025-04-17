import { Pipe, PipeTransform } from '@angular/core'

/**
 * Highlights a keyword from a sentence with a different color
 */
@Pipe({
	name: 'highlightKey',
})
export class HighlightKeyPipe implements PipeTransform {
	transform(sentence: string, keyword: string): unknown {
		if (!keyword) return sentence

		const regex = new RegExp(`(${keyword})`, 'gi') // Case-insensitive match
		return sentence.replace(regex, `<span class="font-semibold text-my-orange">$1</span>`)
	}
}
