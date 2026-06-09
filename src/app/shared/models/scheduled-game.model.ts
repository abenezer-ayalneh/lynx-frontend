export interface ScheduledGame {
	id: number
	invitationText: string
	invitedEmails: string[]
	acceptedEmails: string[]
	startTime: string
	maxPlayers: number
	rounds: number
	roomId: number // This will be updated every time a game that has not be concluded creates a different colyseus room
	status: ScheduledGameStatus
	createdBy: number
	reminder: ScheduledGameReminder
	createdAt: string
	updatedAt: string
	deletedAt: string
}

enum ScheduledGameStatus {
	PENDING, // The scheduled time has not passed yet
	ACTIVE, // The scheduled time has passed
	DONE, // The game has been played(or not) and is done. This means this game will not trigger colyseus room creations any more
}

enum ScheduledGameReminder {
	PENDING,
	SENT,
}
