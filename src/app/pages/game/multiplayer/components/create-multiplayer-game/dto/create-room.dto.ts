export interface CreateRoomDto {
	name: string

	room_id: string

	invite_text: string

	emails: string[]

	status?: boolean

	max_players?: number

	rounds?: number
}
