export enum ScheduledGameType {
	INSTANT = 'INSTANT',
	FUTURE = 'FUTURE',
}

export default interface CreateMultiplayerRoomDto {
	invitation_text: string

	emails: string[]

	gameScheduleType: ScheduledGameType

	start_time?: string

	timezone?: string
}
