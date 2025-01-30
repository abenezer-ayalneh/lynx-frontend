import { Component, signal } from '@angular/core'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgOptimizedImage } from '@angular/common'
import { ButtonComponent } from '../../../shared/components/button/button.component'
import { Router, RouterLink } from '@angular/router'
import { LoginRequest } from './types/login.type'
import { TokenService } from '../../../shared/services/token.service'
import { AuthService } from '../auth.service'
import { finalize, switchMap, tap } from 'rxjs'
import { PlayerService } from '../../../shared/services/player.service'

@Component({
	selector: 'app-login',
	imports: [TextFieldComponent, NgOptimizedImage, ButtonComponent, RouterLink, FormsModule, ReactiveFormsModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent {
	loginFormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	loggingIn = signal<boolean>(false)

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
		private readonly tokenService: TokenService,
		private readonly playerService: PlayerService,
	) {}

	get formControls() {
		return this.loginFormGroup.controls
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
					switchMap(() => this.authService.checkToken()),
				)
				.subscribe({
					next: async (player) => {
						this.playerService.setPlayer = player
						await this.router.navigateByUrl('home')
					},
				})
		}
	}
}
