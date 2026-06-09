import { Component } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'

import { ButtonComponent } from '../../../shared/components/button/button.component'
import { ButtonType } from '../../../shared/components/button/enums/button.enum'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { SnackbarService } from '../../../shared/services/snackbar.service'
import { MatchValidator } from '../../../shared/validators/match-validator'
import { AuthService } from '../auth.service'
import { RegisterRequest } from './types/register.type'

@Component({
	selector: 'app-register',
	imports: [TextFieldComponent, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule],
	templateUrl: './register.component.html',
	styleUrl: './register.component.scss',
})
export class RegisterComponent {
	registerFormGroup = new FormGroup(
		{
			name: new FormControl('', [Validators.required]),
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required]),
			confirmPassword: new FormControl('', [Validators.required]),
		},
		{ validators: [MatchValidator.match('password', 'confirmPassword')] },
	)

	protected readonly ButtonType = ButtonType

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly snackbarService: SnackbarService,
	) {}

	get formControls() {
		return this.registerFormGroup.controls
	}

	registerFormSubmit() {
		if (this.registerFormGroup.valid) {
			const registerRequest: RegisterRequest = {
				name: this.registerFormGroup.value.name!,
				email: this.registerFormGroup.value.email!,
				password: this.registerFormGroup.value.password!,
				confirmPassword: this.registerFormGroup.value.confirmPassword!,
			}

			this.authService
				.register(registerRequest, 'home')
				.then(async ({ error, data }) => {
					console.log({ error, data })

					// TODO: either redirect to home or to an email verification page
					if (error) {
						this.snackbarService.showSnackbar(error.message ?? 'Something went wrong. Please try again later.')
					} else if (data) {
						await this.router.navigateByUrl('auth/login')
					}
				})
				.catch((error) => {
					console.error({ error })
				})
		}
	}
}
