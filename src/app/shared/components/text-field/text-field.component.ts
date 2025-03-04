import { Component, ElementRef, input, signal, viewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { NgClass } from '@angular/common'

@Component({
	selector: 'app-text-field',
	imports: [ReactiveFormsModule, NgClass],
	templateUrl: './text-field.component.html',
	styleUrl: './text-field.component.scss',
})
export class TextFieldComponent {
	shouldShake = signal<boolean>(false)

	control = input.required<FormControl>()

	type = input<string>('text')

	autoComplete = input<string>('')

	placeholder = input<string>('')

	autoFocus = input<boolean>(false)

	inputField = viewChild.required<ElementRef<HTMLInputElement>>('inputField')

	focus() {
		this.inputField().nativeElement.focus()
	}

	shake() {
		this.shouldShake.set(true)

		setTimeout(() => {
			this.shouldShake.set(false)
		}, 1500)
	}
}
