import { RemoteTrackPublication } from 'livekit-client'

import { MultiplayerRoomPlayer } from '../types/multiplayer-room-state.type'

export class Participant {
	id: string // Participant.identity

	name: string

	muted: boolean

	speaking: boolean

	audioLevel: number

	trackPublication?: RemoteTrackPublication

	constructor(id: string, name: string, muted?: boolean, speaking?: boolean, audioLevel?: number) {
		this.id = id
		this.name = name
		this.muted = muted ?? true
		this.speaking = speaking ?? false
		this.audioLevel = audioLevel ?? 0
	}

	static constructPlayers(players: MultiplayerRoomPlayer[]): Participant[] {
		return players.map((player) => new Participant(player.id, player.name))
	}
}
