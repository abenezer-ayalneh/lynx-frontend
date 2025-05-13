import { Player } from '../models/player.model'
import { RestartGameVote } from './restart-game-vote.type'
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
	winner: Score
	score: Map<string, number>
	totalScore: Map<string, Score>
	sessionScore: Map<string, Score>
	words: Word
	gameStarted: boolean
	ownerId: number
	restartGameVote: Map<string, RestartGameVote>
}
