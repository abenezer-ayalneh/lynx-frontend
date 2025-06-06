import { Injectable } from '@angular/core'
import { Client, Room } from 'colyseus.js'

import { environment } from '../../../environments/environment'

const COLYSEUS_URL = environment.colyseusUrl

@Injectable({
	providedIn: 'root',
})
export class ColyseusService {
	#client: Client

	#room: Room | null = null

	constructor() {
		this.#client = new Client(COLYSEUS_URL)
	}

	get getClient() {
		return this.#client
	}

	get room() {
		return this.#room
	}

	set setRoom(room: Room | null) {
		this.#room = room
	}

	/**
	 * Send message via Colyseus client
	 * @param type
	 * @param message
	 */
	sendMessage<T>(type: string, message?: T) {
		this.room?.send(type, message)
	}

	leaveRoom() {
		this.room?.leave()
	}

	pauseGame() {
		this.sendMessage<undefined>('pause')
	}

	resumeGame() {
		this.sendMessage<undefined>('resume')
	}
}
