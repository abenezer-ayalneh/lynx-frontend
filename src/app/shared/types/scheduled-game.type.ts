import { Player } from '../models/player.model'

export interface ScheduledGameCore {
	id: number
	invitationText: string
	invitedEmails: string[]
	roomId: string
	type: ScheduledGameType
	startTime: string
	maxPlayers: number
	rounds: number
	status: ScheduledGameStatus
	createdBy: number
	createdAt: string
	updatedAt: string
	deletedAt: string

	owner: Player
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
