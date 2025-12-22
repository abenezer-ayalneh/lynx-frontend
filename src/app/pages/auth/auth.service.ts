import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { createAuthClient } from 'better-auth/client'

import { environment } from '../../../environments/environment'
import { UserSession } from '../../shared/interfaces/session.interface'
import { TokenService } from '../../shared/services/token.service'
import { LoginRequest } from './login/types/login.type'
import { RegisterRequest } from './register/types/register.type'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	authClient

	constructor(
		private readonly httpClient: HttpClient,
		private readonly router: Router,
		private readonly tokenService: TokenService,
	) {
		this.authClient = createAuthClient({
			baseURL: `${environment.apiUrl}/authentication`,
			fetchOptions: {
				onSuccess: (ctx) => {
					const authToken = ctx.response.headers.get('set-auth-token') ?? (ctx.data.token as string) // get the token from the response headers or response data
					// Store the token securely
					if (authToken) {
						this.tokenService.storeToken(authToken)
					}
				},
				auth: {
					type: 'Bearer',
					token: () => this.tokenService.getAccessToken() || '', // get the token from localStorage
				},
			},
		})
	}

	register(registerRequest: RegisterRequest, callbackURL?: string) {
		return this.authClient.signUp.email({ ...registerRequest, callbackURL })
	}

	login(loginRequest: LoginRequest) {
		return this.authClient.signIn.email(loginRequest)
	}

	async logOut() {
		await this.authClient.signOut()
		await this.router.navigateByUrl('auth/login')
	}

	getSession() {
		return this.httpClient.get<UserSession>('authentication/get-session')
	}
}
