import { Component, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'

import { ButtonComponent } from '../../../shared/components/button/button.component'
import { ButtonType } from '../../../shared/components/button/enums/button.enum'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { SnackbarService } from '../../../shared/services/snackbar.service'
import { MatchValidator } from '../../../shared/validators/match-validator'
import { AuthService } from '../auth.service'

@Component({
	selector: 'app-reset-password',
	imports: [TextFieldComponent, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule],
	templateUrl: './reset-password.component.html',
	styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
	resetPasswordFormGroup = new FormGroup(
		{
			password: new FormControl('', [Validators.required]),
			confirmPassword: new FormControl('', [Validators.required]),
		},
		{ validators: [MatchValidator.match('password', 'confirmPassword')] },
	)

	submitting = signal<boolean>(false)

	error = signal<string | null>(null)

	protected readonly ButtonType = ButtonType

	private token = ''

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly route: ActivatedRoute,
		private readonly snackbarService: SnackbarService,
	) {}

	get formControls() {
		return this.resetPasswordFormGroup.controls
	}

	ngOnInit() {
		this.token = this.route.snapshot.queryParamMap.get('token') || ''
		if (!this.token) {
			this.error.set('Invalid or missing reset token.')
		}
	}

	resetPasswordFormSubmit() {
		if (this.resetPasswordFormGroup.valid && this.token) {
			this.submitting.set(true)
			this.error.set(null)

			this.authService
				.resetPassword(this.token, this.resetPasswordFormGroup.value.password!)
				.then(async ({ error }) => {
					if (error) {
						this.error.set(error.message ?? 'This link has expired or is invalid.')
					} else {
						this.snackbarService.showSnackbar('Password reset successfully. Please log in.')
						await this.router.navigateByUrl('auth/login')
					}
				})
				.catch(() => {
					this.error.set('Something went wrong. Please try again later.')
				})
				.finally(() => {
					this.submitting.set(false)
				})
		}
	}
}
