import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { ScheduledGame } from '../../shared/types/scheduled-game.type'

@Injectable({
	providedIn: 'root',
})
export class RsvpService {
	constructor(private readonly httpClient: HttpClient) {}

	rsvp(email: string, gameId: number) {
		return this.httpClient.get<ScheduledGame>('scheduled-games/rsvp', {
			params: {
				email,
				gameId,
			},
		})
	}
}
