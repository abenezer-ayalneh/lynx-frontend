import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { createAuthClient } from 'better-auth/client'

import { environment } from '../../../environments/environment'
import { Player } from '../../shared/models/player.model'
import { PlayerService } from '../../shared/services/player.service'
import { TokenService } from '../../shared/services/token.service'
import { LoginRequest, LoginResponse } from './login/types/login.type'
import { RegisterRequest } from './register/types/register.type'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private authClient

	constructor(
		private readonly httpClient: HttpClient,
		private readonly tokenService: TokenService,
		private readonly router: Router,
		private readonly playerService: PlayerService,
	) {
		this.authClient = createAuthClient({
			baseURL: `${environment.apiUrl}/authentication`,
		})
	}

	register(registerRequest: RegisterRequest, callbackURL?: string) {
		return this.authClient.signUp.email({ ...registerRequest, callbackURL })
	}

	login(loginRequest: LoginRequest) {
		return this.httpClient.post<LoginResponse>('authentication/sign-in', loginRequest)
	}

	async logOut() {
		this.tokenService.clearTokens()
		this.playerService.clearPlayer()
		await this.router.navigateByUrl('auth/login')
	}

	checkToken() {
		return this.httpClient.get<Player>('authentication/check-token')
	}
}
