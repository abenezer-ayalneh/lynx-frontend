import { Player } from '../models/player.model'

export interface ScheduledGameCore {
	id: number
	invitation_text: string
	invited_emails: string[]
	room_id: string
	type: ScheduledGameType
	start_time: string
	max_players: number
	rounds: number
	status: ScheduledGameStatus
	created_by: number
	created_at: string
	updated_at: string
	deleted_at: string

	Owner: Player
}

export type ScheduledGame = Partial<ScheduledGameCore>

enum ScheduledGameStatus {
	PENDING, // The scheduled time has not passed yet
	ACTIVE, // The scheduled time has passed
	DONE, // The game has been played(or not) and is done. This means this game will not trigger colyseus room creations any more
}

enum ScheduledGameType {
	INSTANT = 'INSTANT',
	FUTURE = 'FUTURE',
}
