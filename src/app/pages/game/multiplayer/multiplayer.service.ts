import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import CreateMultiplayerRoomDto from './dto/create-multiplayer-room.dto'
import { ScheduledGame } from '../../../shared/models/scheduled-game.model'

@Injectable({
	providedIn: 'root',
})
export class MultiplayerService {
	constructor(private readonly httpClient: HttpClient) {}

	createScheduledGame(createMultiplayerRoomDto: CreateMultiplayerRoomDto) {
		return this.httpClient.post<ScheduledGame>('scheduled-games', createMultiplayerRoomDto)
	}
}
