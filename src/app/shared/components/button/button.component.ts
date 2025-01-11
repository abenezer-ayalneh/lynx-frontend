import { Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-button',
	imports: [RouterLink],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent {
	text = input<string>('')
	buttonType = input<'button' | 'link'>('button')
	url = input<string>('/')
	loading = input<boolean>(false)
	disabled = input<boolean>(false)
	class = input<string>('')
	type = input<'button' | 'submit'>('button')

	buttonClicked = output<MouseEvent>()

	handleClick(event: MouseEvent): void {
		if (!this.disabled && !this.loading) {
			this.buttonClicked.emit(event)
		}
	}
}
