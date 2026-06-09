import { Component, signal } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { RouterLink } from '@angular/router'

import { ButtonComponent } from '../../../shared/components/button/button.component'
import { ButtonType } from '../../../shared/components/button/enums/button.enum'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { SnackbarService } from '../../../shared/services/snackbar.service'
import { AuthService } from '../auth.service'

@Component({
	selector: 'app-forgot-password',
	imports: [TextFieldComponent, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule],
	templateUrl: './forgot-password.component.html',
	styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
	forgotPasswordFormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
	})

	submitting = signal<boolean>(false)

	submitted = signal<boolean>(false)

	protected readonly ButtonType = ButtonType

	constructor(
		private readonly authService: AuthService,
		private readonly snackbarService: SnackbarService,
	) {}

	get formControls() {
		return this.forgotPasswordFormGroup.controls
	}

	forgotPasswordFormSubmit() {
		if (this.forgotPasswordFormGroup.valid) {
			this.submitting.set(true)

			this.authService
				.forgotPassword(this.forgotPasswordFormGroup.value.email!)
				.then(() => {
					this.submitted.set(true)
				})
				.catch((error) => {
					console.error({ error })
					this.snackbarService.showSnackbar('Something went wrong. Please try again later.')
				})
				.finally(() => {
					this.submitting.set(false)
				})
		}
	}
}
