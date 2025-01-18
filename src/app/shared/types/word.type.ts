export interface Word {
	id: number
	key: string
	cues: Cue[]
}

export interface Cue {
	id: number
	word: string
	shown: boolean
}
