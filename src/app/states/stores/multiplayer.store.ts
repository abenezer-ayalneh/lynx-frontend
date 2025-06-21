import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'
import { Room as ColyseusRoom } from 'colyseus.js'
import { Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { Participant } from '../../shared/models/game-player.model'
import { GamePlayStatus, GameState, MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { MultiplayerState } from '../interfaces/multiplayer-state.interface'

const initialState: MultiplayerState = {
	pageState: RequestState.LOADING,
	micState: MicState.LOADING,
	liveKitRoom: null,
	colyseusRoom: null,
	player: null,
	players: [],
	participants: [],
	error: null,
	gameId: 0,
	ownerId: 0,
	startTime: '',
	round: 0,
	time: 0,
	cycle: 0,
	word: null,
	waitingCountdownTime: 0,
	gameState: GameState.LOBBY,
	gamePlayStatus: GamePlayStatus.PLAYING,
	winner: null,
	score: new Map(),
	totalScore: new Map(),
	sessionScore: new Map(),
	totalRound: 0,
	words: [],
}

export const MultiplayerStore = signalStore(
	withState(initialState),
	withMethods((store) => ({
		setMicState: (micState: MicState) => {
			patchState(store, (state) => ({ ...state, micState: micState }))
		},
		pauseGame: () => {
			patchState(store, (state) => ({ ...state, gamePlayStatus: GamePlayStatus.PAUSED }))
		},
		resumeGame: () => {
			patchState(store, (state) => ({ ...state, gamePlayStatus: GamePlayStatus.PLAYING }))
		},
		setPageState: (pageState: RequestState) => {
			patchState(store, (state) => ({ ...state, pageState: pageState }))
		},
		setLiveKitRoom: (liveKitRoom: LiveKitRoom) => {
			patchState(store, (state) => ({ ...state, liveKitRoom }))
		},
		setColyseusRoom: (colyseusRoom: ColyseusRoom) => {
			patchState(store, (state) => ({ ...state, colyseusRoom }))
		},
		setPlayer: (name: string) => {
			patchState(store, (state) => ({ ...state, player: { name } }))
		},
		setError: (errorMessage: string) => {
			patchState(store, (state) => ({ ...state, error: errorMessage, pageState: RequestState.ERROR }))
		},
		reflectGameStateChange: (gameState: MultiplayerRoomState) => {
			patchState(store, (state) => ({ ...state, ...gameState, participants: Participant.constructPlayers(gameState.players) }))
		},
		changePlayerMuteState: (participantId: string, muted: boolean) => {
			const players = store.participants()
			const player = players.find((player) => player.participantId === participantId)

			if (player) {
				player.muted = muted
				patchState(store, (state) => ({ ...state, participants: players }))
			}
		},
		changePlayerSpeakingState: (participants: Pick<Participant, 'participantId' | 'speaking' | 'audioLevel'>[]) => {
			const players = store.participants().reduce((aggregate, currentPlayer) => {
				currentPlayer.speaking = participants.find((participant) => participant.participantId === currentPlayer.participantId)?.speaking ?? false

				aggregate.push(currentPlayer)
				return aggregate
			}, [] as Participant[])

			patchState(store, (state) => ({ ...state, participants: players }))
		},
	})),
	withHooks({
		onDestroy: (store) => {
			store.liveKitRoom()?.disconnect(true)
		},
	}),
)
