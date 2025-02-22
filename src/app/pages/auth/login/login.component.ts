import { Component, OnInit, signal } from '@angular/core'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgOptimizedImage } from '@angular/common'
import { ButtonComponent } from '../../../shared/components/button/button.component'
import { Router, RouterLink } from '@angular/router'
import { LoginRequest } from './types/login.type'
import { TokenService } from '../../../shared/services/token.service'
import { AuthService } from '../auth.service'
import { finalize, tap } from 'rxjs'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'

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
						await this.router.navigateByUrl('home')
					},
				})
		}
	}
}
