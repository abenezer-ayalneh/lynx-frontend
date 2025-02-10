export interface ScheduledGame {
	id: number
	invitation_text: string
	invited_emails: string[]
	accepted_emails: string[]
	start_time: string
	max_players: number
	rounds: number
	room_id: number // This will be updated every time a game that has not be concluded creates a different colyseus room
	status: ScheduledGameStatus
	created_by: number
	reminder: ScheduledGameReminder
	created_at: string
	updated_at: string
	deleted_at: string
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
