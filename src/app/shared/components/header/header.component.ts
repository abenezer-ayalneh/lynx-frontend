import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgOptimizedImage } from '@angular/common'
import { AuthService } from '../../../pages/auth/auth.service'

@Component({
	selector: 'app-header',
	imports: [RouterLink, NgOptimizedImage],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent {
	constructor(private readonly authService: AuthService) {}

	async logout() {
		await this.authService.logOut()
	}
}
