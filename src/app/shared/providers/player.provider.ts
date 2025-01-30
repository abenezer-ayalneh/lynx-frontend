import { inject } from '@angular/core'
import { PlayerService } from '../services/player.service'
import { environment } from '../../../environments/environment'
import { TokenService } from '../services/token.service'
import { Player } from '../models/player.model'

const API_URL = environment.apiUrl

export const playerProvider = async () => {
	const playerService = inject(PlayerService)
	const tokenService = inject(TokenService)

	const accessToken = tokenService.getAccessToken()
	const response = await fetch(`${API_URL}/authentication/check-token`, { headers: { Authorization: `Bearer ${accessToken}` } })
	if (response.ok) {
		playerService.setPlayer = (await response.json()) as Player
	} else {
		tokenService.clearTokens()
	}
}
