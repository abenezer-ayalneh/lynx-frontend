import { Score } from '../../../../shared/types/winner.type'
import { Word } from '../../../../shared/types/word.type'

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
