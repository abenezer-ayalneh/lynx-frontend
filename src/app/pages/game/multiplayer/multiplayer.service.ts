import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import CreateMultiplayerRoomDto from './dto/create-multiplayer-room.dto'
import { Score } from '../../../shared/types/winner.type'

@Injectable({
	providedIn: 'root',
})
export class MultiplayerService {
	sessionScore = signal<Score | undefined>(undefined)

	constructor(private readonly httpClient: HttpClient) {}

	createScheduledGame(createMultiplayerRoomDto: CreateMultiplayerRoomDto) {
		return this.httpClient.post<{ lobbyId: string }>('scheduled-games', createMultiplayerRoomDto)
	}
}
