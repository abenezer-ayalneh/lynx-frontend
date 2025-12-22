export enum ScheduledGameType {
	INSTANT = 'INSTANT',
	FUTURE = 'FUTURE',
}

export default interface CreateMultiplayerRoomDto {
	invitationText: string

	emails: string[]

	gameScheduleType: ScheduledGameType

	startTime?: string

	timezone?: string
}
