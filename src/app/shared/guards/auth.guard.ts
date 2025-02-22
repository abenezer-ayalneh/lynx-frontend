import { CanActivateFn, RedirectCommand, Router } from '@angular/router'
import { inject } from '@angular/core'
import { TokenService } from '../services/token.service'
import { PlayerService } from '../services/player.service'
import { Player } from '../models/player.model'
import { environment } from '../../../environments/environment'

const API_URL = environment.apiUrl

export const authGuard: CanActivateFn = async () => {
	const tokenService = inject(TokenService)
	const playerService = inject(PlayerService)
	const router = inject(Router)

	const accessToken = tokenService.getAccessToken()
	if (accessToken) {
		if (!playerService.getPlayer.getValue()) {
			const response = await fetch(`${API_URL}/authentication/check-token`, { headers: { Authorization: `Bearer ${accessToken}` } })
			if (response.ok) {
				playerService.setPlayer = (await response.json()) as Player
			} else {
				return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })
			}
		}

		return true
	}

	tokenService.clearTokens()
	return new RedirectCommand(router.parseUrl('/auth/login'), { skipLocationChange: true })
}
