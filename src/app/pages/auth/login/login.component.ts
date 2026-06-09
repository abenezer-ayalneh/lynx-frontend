import { Component, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'

import { environment } from '../../../../environments/environment'
import { ButtonComponent } from '../../../shared/components/button/button.component'
import { ButtonType } from '../../../shared/components/button/enums/button.enum'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { SnackbarService } from '../../../shared/services/snackbar.service'
import { TokenService } from '../../../shared/services/token.service'
import { AuthService } from '../auth.service'
import { LoginRequest } from './types/login.type'

@Component({
	selector: 'app-login',
	imports: [TextFieldComponent, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule, LoadingComponent],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
	loginFormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	loaded = signal<boolean>(false)

	loggingIn = signal<boolean>(false)

	redirectionUrl = ''

	protected readonly ButtonType = ButtonType

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly tokenService: TokenService,
		private readonly snackbarService: SnackbarService,
	) {}

	get formControls() {
		return this.loginFormGroup.controls
	}

	async ngOnInit() {
		if (this.tokenService.getAccessToken()) {
			await this.router.navigateByUrl('home')
		}

		this.loaded.set(true)

		this.redirectionUrl = localStorage.getItem('redirectionUrl') ?? 'home'
	}

	loginFormSubmit() {
		if (this.loginFormGroup.valid) {
			this.loggingIn.set(true)
			const loginRequest: LoginRequest = {
				email: this.loginFormGroup.value.email!,
				password: this.loginFormGroup.value.password!,
			}

			this.authService
				.login(loginRequest)
				.then(async ({ data, error }) => {
					if (error) {
						this.snackbarService.showSnackbar(error.message ?? 'Failed to login')
					} else if (data) {
						localStorage.removeItem('redirectionUrl')
						await this.router.navigateByUrl(this.redirectionUrl)
					}
				})
				.catch((error) => {
					console.error({ error })
				})
				.finally(() => {
					this.loggingIn.set(false)
				})
		}
	}

	async loginWithGoogle() {
		this.authService.authClient.signIn
			.social({
				provider: 'google',
				callbackURL: `${environment.appUrl}/home`,
			})
			.then(async (response) => {
				console.log({ response })
			})
	}
}
