import { Component } from '@angular/core'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgOptimizedImage } from '@angular/common'
import { ButtonComponent } from '../../../shared/components/button/button.component'
import { Router, RouterLink } from '@angular/router'
import { LoginService } from './login.service'
import { LoginRequest } from './types/login.type'

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

	constructor(
		private readonly loginService: LoginService,
		private readonly router: Router,
	) {}

	get formControls() {
		return this.loginFormGroup.controls
	}

	loginFormSubmit() {
		if (this.loginFormGroup.valid) {
			const loginRequest: LoginRequest = {
				email: this.loginFormGroup.value.email!,
				password: this.loginFormGroup.value.password!,
			}
			this.loginService.login(loginRequest).subscribe({
				next: async () => {
					await this.router.navigateByUrl('home')
				},
			})
		}
	}
}
