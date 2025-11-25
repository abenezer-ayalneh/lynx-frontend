import { Injectable } from '@angular/core'
import { Client, Room } from 'colyseus.js'

import { environment } from '../../../environments/environment'
import { PAUSE, RESUME } from '../constants/colyseus-message.constant'

const COLYSEUS_URL = environment.colyseusUrl

@Injectable({
	providedIn: 'root',
})
export class ColyseusService {
	readonly #client: Client

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
		// Clean up the previous room before setting a new one
		if (this.#room && this.#room !== room) {
			this.#room.leave()
		}
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
		if (this.#room) {
			this.#room.leave()
			this.#room = null
		}
	}

	pauseGame() {
		this.sendMessage<undefined>(PAUSE)
	}

	resumeGame() {
		this.sendMessage<undefined>(RESUME)
	}
}
