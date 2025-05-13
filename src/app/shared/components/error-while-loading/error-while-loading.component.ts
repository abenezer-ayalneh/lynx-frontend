import { Component, input } from '@angular/core'

import { ButtonComponent } from '../button/button.component'

@Component({
	selector: 'app-error-while-loading',
	imports: [ButtonComponent],
	templateUrl: './error-while-loading.component.html',
	styleUrl: './error-while-loading.component.scss',
})
export class ErrorWhileLoadingComponent {
	subTitle = input<string>('')

	retryFn = input<() => void>()
}
