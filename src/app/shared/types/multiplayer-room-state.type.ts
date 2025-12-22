import { Score } from './winner.type'
import { Word } from './word.type'

export interface MultiplayerRoomState {
	gameId: number
	ownerId: string
	startTime: string
	players: MultiplayerRoomPlayer[]
	round: number
	time: number
	cycle: number
	word: Word | null
	waitingCountdownTime: number
	gameState: GameState
	gamePlayStatus: GamePlayStatus
	winner: Score | null
	score: Map<string, number>
	totalScore: Map<string, Score>
	sessionScore: Map<string, Score>
	totalRound: number
	words: Word[]
}

export enum GameState {
	LOBBY = 'LOBBY',
	START_COUNTDOWN = 'START_COUNTDOWN',
	GAME_STARTED = 'GAME_STARTED',
	ROUND_END = 'ROUND_END',
	GAME_END = 'GAME_END',
}

export enum GamePlayStatus {
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
}

export interface MultiplayerRoomPlayer {
	id: string
	name: string
}
