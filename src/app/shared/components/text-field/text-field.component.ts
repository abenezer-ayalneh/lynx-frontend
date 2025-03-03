import { Component, ElementRef, input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

@Component({
	selector: 'app-text-field',
	imports: [ReactiveFormsModule],
	templateUrl: './text-field.component.html',
	styleUrl: './text-field.component.scss',
})
export class TextFieldComponent {
	control = input.required<FormControl>()

	type = input<string>('text')

	autoComplete = input<string>('')

	placeholder = input<string>('')

	constructor(private readonly element: ElementRef) {}

	focus() {
		this.element.nativeElement.focus()
	}
}
