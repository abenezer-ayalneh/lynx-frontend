import { inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals'
import { Room as ColyseusRoom } from 'colyseus.js'
import { Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { GamePlayer } from '../../shared/models/game-player.model'
import { LiveKitService } from '../../shared/services/live-kit.service'
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
	gamePlayers: [],
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
	withProps(() => ({
		liveKitService: inject(LiveKitService),
		activatedRoute: inject(ActivatedRoute),
	})),
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
			patchState(store, (state) => ({ ...state, ...gameState, gamePlayers: GamePlayer.constructPlayers(gameState.players) }))
		},
		changePlayerMuteState: (participantId: string, muted: boolean) => {
			const players = store.gamePlayers()
			const player = players.find((player) => player.participantId === participantId)

			if (player) {
				player.muted = muted
				patchState(store, (state) => ({ ...state, gamePlayers: players }))
			}
		},
		changePlayerSpeakingState: (participantIds: string[]) => {
			const players = store.gamePlayers().reduce((aggregate, currentPlayer) => {
				currentPlayer.speaking = participantIds.includes(currentPlayer.participantId)

				aggregate.push(currentPlayer)
				return aggregate
			}, [] as GamePlayer[])

			patchState(store, (state) => ({ ...state, gamePlayers: players }))
		},
	})),
	withHooks({
		onDestroy: (store) => {
			store.liveKitRoom()?.disconnect(true)
		},
	}),
)
