export interface LobbyRoomState {
	gameId: number
	startTime: string
	ownerId: number
	playerNames: Map<string, string>
}
