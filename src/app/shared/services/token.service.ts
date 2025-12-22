import { Injectable } from '@angular/core'


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

	storeToken(accessToken: string) {
		localStorage.setItem('accessToken', accessToken)
	}

	clearTokens() {
		localStorage.removeItem('accessToken')
	}
}
