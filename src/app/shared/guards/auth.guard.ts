import { CanActivateFn } from '@angular/router'
import { inject } from '@angular/core'
import { TokenService } from '../services/token.service'

export const authGuard: CanActivateFn = () => {
	const tokenService = inject(TokenService)
	const token = tokenService.getAccessToken()

	if (token) {
		return true
	}

	window.location.href = 'auth/login' // This is intentional!

	return false
}
