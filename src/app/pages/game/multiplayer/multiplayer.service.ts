import { HttpClient } from '@angular/common/http'
import { Injectable, signal } from '@angular/core'

import { ScheduledGame } from '../../../shared/types/scheduled-game.type'
import { Score } from '../../../shared/types/winner.type'
import CreateMultiplayerRoomDto from './dto/create-multiplayer-room.dto'

@Injectable({
	providedIn: 'root',
})
export class MultiplayerService {
	sessionScore = signal<Score | undefined>(undefined)

	constructor(private readonly httpClient: HttpClient) {}

	createScheduledGame(createMultiplayerRoomDto: CreateMultiplayerRoomDto) {
		return this.httpClient.post<ScheduledGame>('scheduled-games', createMultiplayerRoomDto)
	}

	getScheduledGameById(id: string) {
		return this.httpClient.get<ScheduledGame>(`scheduled-games/${id}`)
	}
}
