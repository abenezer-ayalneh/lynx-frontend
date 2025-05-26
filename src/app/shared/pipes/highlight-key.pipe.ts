import { Pipe, PipeTransform } from '@angular/core'

/**
 * Highlights a keyword from a sentence with a different color
 */
@Pipe({
	name: 'highlightKey',
})
export class HighlightKeyPipe implements PipeTransform {
	transform(sentence: string, keyword: string, extraClasses?: string): unknown {
		if (!keyword) return sentence

		const colorClassAttribute = extraClasses ? `${extraClasses}` : 'text-my-orange'

		const regex = new RegExp(`(${keyword})`, 'i') // Case-insensitive match
		return sentence.replace(regex, `<span class="font-semibold ${colorClassAttribute}">$1</span>`)
	}
}
