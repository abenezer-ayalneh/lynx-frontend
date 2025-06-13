import { inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals'
import { Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { LiveKitService } from '../../shared/services/live-kit.service'
import { GameStatus } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { MultiplayerState } from '../interfaces/multiplayer-state.interface'

const initialState: MultiplayerState = {
	pageState: RequestState.LOADING,
	micState: MicState.LOADING,
	gameStatus: GameStatus.ONGOING,
	liveKitRoom: null,
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
			patchState(store, (state) => ({ ...state, gameStatus: GameStatus.PAUSED }))
		},
		resumeGame: () => {
			patchState(store, (state) => ({ ...state, gameStatus: GameStatus.ONGOING }))
		},
		setPageState: (pageState: RequestState) => {
			patchState(store, (state) => ({ ...state, pageState: pageState }))
		},
		setLiveKitRoom: (liveKitRoom: LiveKitRoom) => {
			patchState(store, (state) => ({ ...state, liveKitRoom }))
		},
	})),
	withHooks({
		onDestroy: (store) => {
			store.liveKitRoom()?.disconnect(true)
		},
	}),
)
