import { Component, input } from '@angular/core'
import { FormControl } from '@angular/forms'

@Component({
	selector: 'app-text-field',
	imports: [],
	templateUrl: './text-field.component.html',
	styleUrl: './text-field.component.scss',
})
export class TextFieldComponent {
	control = input.required<FormControl>()
	type = input<string>('text')
	placeholder = input<string>('')
}
