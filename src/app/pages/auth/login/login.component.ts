import { NgOptimizedImage } from '@angular/common'
import { Component, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { finalize, tap } from 'rxjs'

import { ButtonComponent } from '../../../shared/components/button/button.component'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { TokenService } from '../../../shared/services/token.service'
import { AuthService } from '../auth.service'
import { LoginRequest } from './types/login.type'

@Component({
	selector: 'app-login',
	imports: [TextFieldComponent, NgOptimizedImage, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule, LoadingComponent],
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

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly tokenService: TokenService,
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
				.pipe(
					finalize(() => this.loggingIn.set(false)),
					tap((loginResponse) => this.tokenService.storeTokens(loginResponse)),
				)
				.subscribe({
					next: async () => {
						localStorage.removeItem('redirectionUrl')
						await this.router.navigateByUrl(this.redirectionUrl)
					},
				})
		}
	}
}
