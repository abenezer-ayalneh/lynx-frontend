import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
	selector: '[appTrimInput]',
})
export class TrimInputDirective {
	constructor(private readonly element: ElementRef) {}

	@HostListener('blur')
	onBlur() {
		this.element.nativeElement.value = this.element.nativeElement.value.trim()
	}
}
