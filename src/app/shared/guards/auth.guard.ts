import { inject } from '@angular/core'
import { CanActivateFn, RedirectCommand, Router } from '@angular/router'

import { AuthService } from '../../pages/auth/auth.service'
import { Role } from '../models/player.model'
import { PlayerService } from '../services/player.service'

export const authGuard: CanActivateFn = async () => {
	const authService = inject(AuthService)
	const playerService = inject(PlayerService)
	const router = inject(Router)
	const { data } = await authService.authClient.getSession()

	if (data) {
		playerService.setPlayer = { ...data.user, id: data.user.id, role: Role.PLAYER, score: 0 }
		return true
	}

	return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })

	// const tokenService = inject(TokenService)
	// const playerService = inject(PlayerService)
	// const router = inject(Router)
	//
	// const accessToken = tokenService.getAccessToken()
	// if (accessToken) {
	// 	if (!playerService.getPlayer.getValue()) {
	// 		try {
	// 			playerService.setPlayer = await lastValueFrom(authService.checkToken())
	// 		} catch (e) {
	// 			console.error(e)
	// 			return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })
	// 		}
	// 	}
	//
	// 	return true
	// }
	//
	// tokenService.clearTokens()
	// return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })
}
