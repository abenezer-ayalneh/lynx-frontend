import { Injectable } from '@angular/core'
import { Client, Room } from 'colyseus.js'
import { environment } from '../../../environments/environment'
import { BehaviorSubject } from 'rxjs'
import { SoloPlayRoomState } from '../../pages/game/solo-play/types/solo-room-state.type'

const COLYSEUS_URL = environment.colyseusUrl

@Injectable({
	providedIn: 'root',
})
export class ColyseusService {
	soloRoomState = new BehaviorSubject<SoloPlayRoomState | null>(null)

	private readonly client: Client

	room: Room | null = null

	constructor() {
		this.client = new Client(COLYSEUS_URL)
	}

	get getClient() {
		return this.client
	}

	get getRoom() {
		return this.room
	}

	setRoom(room: Room | null) {
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
