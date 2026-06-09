export interface CreateRoomDto {
	name: string

	roomId: string

	inviteText: string

	emails: string[]

	status?: boolean

	maxPlayers?: number

	rounds?: number
}
