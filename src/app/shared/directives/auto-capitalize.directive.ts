import { Directive, HostListener } from '@angular/core'

@Directive({
	selector: '[appAutoCapitalize]',
})
export class AutoCapitalizeDirective {
	@HostListener('input', ['$event'])
	onInput(event: Event) {
		const target = event.target as HTMLInputElement
		target.value = target.value.toUpperCase()
	}
}
