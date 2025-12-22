import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { lastValueFrom } from 'rxjs'

import { AuthService } from '../../pages/auth/auth.service'
import { PlayerService } from '../services/player.service'
import { TokenService } from '../services/token.service'

export const optionalAuthGuardGuard: CanActivateFn = async () => {
	const tokenService = inject(TokenService)
	const playerService = inject(PlayerService)
	const authService = inject(AuthService)

	const accessToken = tokenService.getAccessToken()
	if (accessToken) {
		if (!playerService.getPlayer.getValue()) {
			try {
				const userSession = await lastValueFrom(authService.getSession())
				playerService.setPlayer = userSession.user
			} catch (e) {
				console.error(e)
			}
		}
	}

	return true
}
