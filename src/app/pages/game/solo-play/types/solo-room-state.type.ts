import { Word } from '../../../../shared/types/word.type'
import { Winner } from '../../../../shared/types/winner.type'

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
	winner: Winner
	midGameCountdown: number
	score: number
	totalScore: number
}
