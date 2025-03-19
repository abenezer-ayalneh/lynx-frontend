import { Word } from '../../../../shared/types/word.type'
import { Score } from '../../../../shared/types/winner.type'

export interface SoloPlayRoomState {
	guessing: boolean
	round: number
	totalRound: number
	time: number
	wordCount: number
	word?: Word
	numberOfPlayers: number
	waitingCountdownTime: number
	gameState: 'START_COUNTDOWN' | 'ROUND_END' | 'GAME_STARTED' | 'GAME_END'
	winner: Score
	midGameCountdown: number
	score: number
	totalScore: Map<string, Score>
}
