import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import CreateMultiplayerRoomDto from './dto/create-multiplayer-room.dto'

@Injectable({
	providedIn: 'root',
})
export class MultiplayerService {
	constructor(private readonly httpClient: HttpClient) {}

	createScheduledGame(createMultiplayerRoomDto: CreateMultiplayerRoomDto) {
		return this.httpClient.post<{ link: string }>('scheduled-games', createMultiplayerRoomDto)
	}
}
