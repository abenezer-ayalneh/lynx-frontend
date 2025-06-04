import { Player } from '../models/player.model'
import { Score } from './winner.type'
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
	gameStatus: 'ONGOING' | 'PAUSED'
	winner: Score
	score: Map<string, number>
	totalScore: Map<string, Score>
	sessionScore: Map<string, Score>
	words: Word
	gameStarted: boolean
	ownerId: number
}
