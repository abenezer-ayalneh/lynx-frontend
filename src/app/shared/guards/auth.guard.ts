import { CanActivateFn, RedirectCommand, Router } from '@angular/router'
import { inject } from '@angular/core'
import { TokenService } from '../services/token.service'
import { PlayerService } from '../services/player.service'
import { AuthService } from '../../pages/auth/auth.service'
import { lastValueFrom } from 'rxjs'

export const authGuard: CanActivateFn = async () => {
	const tokenService = inject(TokenService)
	const playerService = inject(PlayerService)
	const authService = inject(AuthService)
	const router = inject(Router)

	const accessToken = tokenService.getAccessToken()
	if (accessToken) {
		if (!playerService.getPlayer.getValue()) {
			playerService.setPlayer = await lastValueFrom(authService.checkToken())
		}

		return true
	}

	tokenService.clearTokens()
	return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })
}
