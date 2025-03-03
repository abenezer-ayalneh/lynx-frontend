import { Injectable } from '@angular/core'
import { Client, Room } from 'colyseus.js'
import { environment } from '../../../environments/environment'
import { BehaviorSubject } from 'rxjs'
import { MultiplayerRoomState } from '../types/multiplayer-room-state.type'

const COLYSEUS_URL = environment.colyseusUrl

@Injectable({
	providedIn: 'root',
})
export class ColyseusService {
	multiPlayerRoomState$ = new BehaviorSubject<MultiplayerRoomState | null>(null)

	private readonly client: Client

	private room: Room | null = null

	constructor() {
		this.client = new Client(COLYSEUS_URL)
	}

	get getClient() {
		return this.client
	}

	get getRoom() {
		return this.room
	}

	set setRoom(room: Room | null) {
		this.room = room
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
		this.sendMessage<undefined>('exit')
	}
}
