export interface Player {
	id: string
	name: string
	email: string
	score: number
	role: string
}

export enum Role {
	ADMIN = 'admin',
	USER = 'user',
}
