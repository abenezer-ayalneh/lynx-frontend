import { Player } from '../models/player.model'
import { Word } from './word.type'

export interface MultiplayerRoomState {
	players: Player[]
	gameId: number
	minPlayersSatisfied: boolean
	guessing: boolean
	round: number
	totalRound: number
	time: number
	cycle: number
	word: Word
	waitingCountdownTime: number
	gameState: 'START_COUNTDOWN' | 'ROUND_END' | 'GAME_STARTED' | 'GAME_END'
	winner: string
	score: Map<string, number>
	totalScore: Map<string, number>
	words: Word
	gameStarted: boolean
}
