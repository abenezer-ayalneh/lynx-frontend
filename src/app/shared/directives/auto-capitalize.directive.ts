import { Directive, HostListener } from '@angular/core'

@Directive({
	selector: '[appAutoCapitalize]',
})
export class AutoCapitalizeDirective {
	@HostListener('input', ['$event'])
	onInput(event: Event) {
		const target = event.target as HTMLInputElement
		const cursorPosition = target.selectionStart || 0
		const originalValue = target.value
		target.value = target.value.toUpperCase()

		// Restore cursor position, accounting for any length changes
		const lengthDiff = target.value.length - originalValue.length
		const newPosition = Math.max(0, cursorPosition + lengthDiff)
		target.setSelectionRange(newPosition, newPosition)
	}
}
