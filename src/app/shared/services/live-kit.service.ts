import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable({
	providedIn: 'root',
})
export class LiveKitService {
	constructor(private readonly httpClient: HttpClient) {}

	getToken(gameId: string) {
		return this.httpClient.get<{ token: string }>('live-kit/token', { params: { gameId } })
	}
}
