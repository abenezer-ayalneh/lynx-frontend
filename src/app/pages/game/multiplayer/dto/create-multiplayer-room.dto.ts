export default interface CreateMultiplayerRoomDto {
	invitation_text: string

	emails: string[]

	start_time: string

	timezone: string
}
