import { Component, input, output } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { ButtonColor, ButtonType } from './enums/button.enum'

@Component({
	selector: 'app-button',
	imports: [RouterLink, MatIcon],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent {
	text = input.required<string>()

	buttonType = input<ButtonType>(ButtonType.BUTTON)

	color = input<ButtonColor>(ButtonColor.PRIMARY)

	url = input<string>('/')

	loading = input<boolean>(false)

	disabled = input<boolean>(false)

	class = input<string>('')

	iconName = input<string>('')

	whenClickedOutput = output()

	protected readonly ButtonType = ButtonType

	whenClicked() {
		this.whenClickedOutput.emit()
	}
}
