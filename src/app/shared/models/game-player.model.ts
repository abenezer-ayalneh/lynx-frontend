import { MultiplayerRoomPlayer } from '../types/multiplayer-room-state.type'

export class Participant {
	id: string

	participantId: string

	name: string

	muted: boolean

	speaking: boolean

	audioLevel: number

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
		this.participantId = `lynx-player-${id}`
		this.muted = true
		this.speaking = false
		this.audioLevel = 0
	}

	static constructPlayers(players: MultiplayerRoomPlayer[]): Participant[] {
		return players.map((player) => new Participant(player.id, player.name))
	}
}
