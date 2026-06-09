export interface UserSession {
	session: {
		expiresAt: string
		token: string
		createdAt: string
		updatedAt: string
		ipAddress: string
		userAgent: string
		userId: string
		impersonatedBy: string | null
		id: string
	}
	user: {
		id: string
		name: string
		email: string
		emailVerified: boolean
		image: string | null
		createdAt: string
		updatedAt: string
		role: string
		score: number
		banned: boolean
		banReason: string | null
		banExpires: string | null
	}
}
