import { MultiplayerRoomPlayer } from '../types/multiplayer-room-state.type'

export class GamePlayer {
	id: string

	participantId: string

	name: string

	muted: boolean

	speaking: boolean

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
		this.participantId = `lynx-player-${id}`
		this.muted = true
		this.speaking = false
	}

	static constructPlayers(players: MultiplayerRoomPlayer[]): GamePlayer[] {
		return players.map((player) => new GamePlayer(player.id, player.name))
	}
}
