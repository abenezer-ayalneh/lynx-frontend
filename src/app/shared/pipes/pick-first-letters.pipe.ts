import { Pipe, PipeTransform } from '@angular/core'

/**
 * A custom Angular pipe that extracts the first letters of each word in a given phrase.
 * This pipe is useful for creating abbreviations or acronyms.
 *
 * @export
 * @class PickFirstLettersPipe
 * @implements {PipeTransform}
 */
@Pipe({
	name: 'pickFirstLetters',
})
export class PickFirstLettersPipe implements PipeTransform {
	transform(phrase: string): unknown {
		const words = phrase.split(' ')
		return words.map((word) => word.charAt(0).toUpperCase()).join('')
	}
}
