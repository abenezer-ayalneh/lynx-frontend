import { Player } from '../models/player.model'
import { Word } from './word.type'
import { Score } from './winner.type'

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
	winner: Score
	score: Map<string, number>
	totalScore: Map<string, Score>
	words: Word
	gameStarted: boolean
	ownerId: number
}
