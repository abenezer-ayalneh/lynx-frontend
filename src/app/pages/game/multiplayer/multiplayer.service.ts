import { HttpClient } from '@angular/common/http'
import { Injectable, signal } from '@angular/core'

import { Score } from '../../../shared/types/winner.type'
import CreateMultiplayerRoomDto from './dto/create-multiplayer-room.dto'

@Injectable({
	providedIn: 'root',
})
export class MultiplayerService {
	sessionScore = signal<Score | undefined>(undefined)

	constructor(private readonly httpClient: HttpClient) {}

	createScheduledGame(createMultiplayerRoomDto: CreateMultiplayerRoomDto) {
		return this.httpClient.post<{ lobbyId: string; gameId: number | string }>('scheduled-games', createMultiplayerRoomDto)
	}
}
