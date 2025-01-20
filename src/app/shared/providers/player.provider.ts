import { inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Player } from '../models/player.model'
import { PlayerService } from '../services/player.service'
import { filter, tap } from 'rxjs'

export const playerProvider = () => {
	const httpClient = inject(HttpClient)
	const playerService = inject(PlayerService)

	return httpClient.get<Player>('authentication/check-token').pipe(
		filter(Boolean),
		tap((player) => (playerService.setPlayer = player)),
	)
}
