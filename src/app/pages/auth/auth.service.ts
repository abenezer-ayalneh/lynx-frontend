import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { RegisterRequest } from './register/types/register.type'
import { LoginRequest, LoginResponse } from './login/types/login.type'
import { TokenService } from '../../shared/services/token.service'
import { Router } from '@angular/router'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(
		private readonly httpClient: HttpClient,
		private readonly tokenService: TokenService,
		private readonly router: Router,
	) {}

	register(registerRequest: RegisterRequest) {
		return this.httpClient.post<void>('authentication/sign-up', registerRequest)
	}

	login(loginRequest: LoginRequest) {
		return this.httpClient.post<LoginResponse>('authentication/sign-in', loginRequest)
	}

	async logOut() {
		this.tokenService.clearTokens()
		await this.router.navigateByUrl('auth/login')
	}
}
