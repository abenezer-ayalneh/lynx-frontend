import { Injectable } from '@angular/core'

import { LoginResponse } from '../../pages/auth/login/types/login.type'

@Injectable({
	providedIn: 'root',
})
export class TokenService {
	/**
	 * Gets the access token from storage
	 */
	getAccessToken() {
		return localStorage.getItem('accessToken')
	}

	storeTokens(loginResponse: LoginResponse) {
		localStorage.setItem('accessToken', loginResponse.accessToken)
		localStorage.setItem('refreshToken', loginResponse.refreshToken)
	}

	clearTokens() {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
	}
}
