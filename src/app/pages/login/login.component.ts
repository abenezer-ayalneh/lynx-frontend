import { Component } from '@angular/core'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { NgOptimizedImage } from '@angular/common'
import { ButtonComponent } from '../../shared/components/button/button.component'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-login',
	imports: [TextFieldComponent, NgOptimizedImage, ButtonComponent, RouterLink],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent {
	loginFormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	get formControls() {
		return this.loginFormGroup.controls
	}
}
