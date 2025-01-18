import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Game } from '../../../shared/models/game.model'
import { CreateSoloGameRequest } from './types/solo-play.type'

@Injectable({
	providedIn: 'root',
})
export class SoloPlayService {
	constructor(private readonly httpClient: HttpClient) {}

	createGame(createSoloGameRequest: CreateSoloGameRequest) {
		return this.httpClient.post<Game>('games', createSoloGameRequest)
	}
}
