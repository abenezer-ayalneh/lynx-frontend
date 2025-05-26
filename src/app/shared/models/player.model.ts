export interface Player {
	id: number
	name: string
	email: string
	score: number
	role: Role
}

export enum Role {
	ADMIN = 'ADMIN',
	PLAYER = 'PLAYER',
}
