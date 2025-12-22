import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { createAuthClient } from 'better-auth/client'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'

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
			baseURL: 'http://localhost:4000',
			fetchOptions: {
				onSuccess: (ctx) => {
					if (ctx.data) {
						const authToken = ctx.response.headers.get('set-auth-token') ?? (ctx.data?.token as string) // get the token from the response headers or response data
						// Store the token securely
						if (authToken) {
							this.tokenService.storeToken(authToken)
						}
					}
				},
				auth: {
					type: 'Bearer',
					token: () => this.tokenService.getAccessToken() || '', // get the token from localStorage
				},
			},
			plugins: [
				adminClient(),
				inferAdditionalFields({
					user: {
						score: {
							type: 'number',
							required: true,
							defaultValue: 0,
						},
						role: {
							type: 'string',
							required: true,
							defaultValue: 'user',
						},
					},
				}),
			],
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
