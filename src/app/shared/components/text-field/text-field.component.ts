import { NgClass } from '@angular/common'
import { Component, ElementRef, input, OnDestroy, signal, viewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

import { TrimInputDirective } from '../../directives/trim-input.directive'

@Component({
	selector: 'app-text-field',
	imports: [ReactiveFormsModule, NgClass, TrimInputDirective],
	templateUrl: './text-field.component.html',
	styleUrl: './text-field.component.scss',
})
export class TextFieldComponent implements OnDestroy {
	shouldShake = signal<boolean>(false)

	control = input.required<FormControl>()

	type = input<string>('text')

	autoComplete = input<string>('')

	placeholder = input<string>('')

	autoFocus = input<boolean>(false)

	inputField = viewChild.required<ElementRef<HTMLInputElement>>('inputField')

	private shakeTimeout: ReturnType<typeof setTimeout> | null = null

	focus() {
		this.inputField().nativeElement.focus()
	}

	ngOnDestroy() {
		if (this.shakeTimeout) {
			clearTimeout(this.shakeTimeout)
			this.shakeTimeout = null
		}
	}

	shake() {
		this.shouldShake.set(true)

		if (this.shakeTimeout) {
			clearTimeout(this.shakeTimeout)
		}

		this.shakeTimeout = setTimeout(() => {
			this.shouldShake.set(false)
			this.shakeTimeout = null
		}, 1500)
	}
}
