import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'
import { Room as ColyseusRoom } from 'colyseus.js'
import { LocalAudioTrack, RemoteTrackPublication, Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { Participant } from '../../shared/models/game-player.model'
import { GamePlayStatus, GameState, MultiplayerRoomPlayer, MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { ScheduledGame } from '../../shared/types/scheduled-game.type'
import { MultiplayerState } from '../interfaces/multiplayer-state.interface'

const initialState: MultiplayerState = {
	pageState: RequestState.LOADING,
	micState: MicState.LOADING,
	liveKitRoom: undefined,
	colyseusRoom: undefined,
	player: null,
	players: [],
	remoteParticipants: {},
	localTrack: undefined,
	error: null,
	scheduledGame: null,
	gameId: 0,
	ownerId: '',
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

		setScheduledGame: (scheduledGame: ScheduledGame | null) => {
			patchState(store, (state) => ({ ...state, scheduledGame, startTime: scheduledGame?.startTime, ownerId: scheduledGame?.owner?.id }))
		},

		setPageState: (pageState: RequestState) => {
			patchState(store, (state) => ({ ...state, pageState: pageState }))
		},

		setLiveKitRoom: (liveKitRoom: LiveKitRoom | undefined) => {
			patchState(store, (state) => ({ ...state, liveKitRoom }))
		},

		setColyseusRoom: (colyseusRoom: ColyseusRoom | undefined) => {
			patchState(store, (state) => ({ ...state, colyseusRoom }))
		},

		setPlayer: (name: string) => {
			patchState(store, (state) => ({ ...state, player: { name } }))
		},

		setError: (errorMessage: string) => {
			patchState(store, (state) => ({ ...state, error: errorMessage, pageState: RequestState.ERROR }))
		},

		reflectGameStateChange: (gameState: MultiplayerRoomState) => {
			patchState(store, (state) => ({ ...state, ...gameState }))
		},

		updateRemoteParticipants: (players: MultiplayerRoomPlayer[]) => {
			const remoteParticipants: Record<string, Participant> = {}
			const existingRemoteParticipants = store.remoteParticipants()

			// Decide what to keep and what to add.
			players.forEach((player) => {
				const existingPlayer = existingRemoteParticipants[player.id]

				if (existingPlayer) {
					remoteParticipants[existingPlayer.id] = existingPlayer
				} else {
					remoteParticipants[player.id] = new Participant(player.id, player.name)
				}
			})

			patchState(store, (state) => ({ ...state, remoteParticipants }))
		},

		changePlayerMuteState: (participantId: string, muted: boolean) => {
			const remoteParticipants = store.remoteParticipants()
			const player = remoteParticipants[participantId]

			if (player) {
				player.muted = muted
				patchState(store, (state) => ({ ...state, remoteParticipants }))
			}
		},

		changePlayerSpeakingState: (participants: Pick<Participant, 'id' | 'speaking' | 'audioLevel'>[]) => {
			const remoteParticipants = store.remoteParticipants()
			const speakingParticipantsIds: string[] = []

			participants.forEach((participant) => {
				speakingParticipantsIds.push(participant.id)
				const remoteParticipant = remoteParticipants[participant.id]
				if (remoteParticipant) {
					remoteParticipant.speaking = participant.speaking
					remoteParticipant.audioLevel = participant.audioLevel
				}
			})

			const participantsNotSpeaking = Object.values(remoteParticipants).filter((participant) => !speakingParticipantsIds.includes(participant.id))
			participantsNotSpeaking.forEach((participant) => {
				const remoteParticipant = remoteParticipants[participant.id]
				if (remoteParticipant) {
					remoteParticipant.speaking = false
					remoteParticipant.audioLevel = 0
				}
			})

			patchState(store, (state) => ({ ...state, remoteParticipants: { ...remoteParticipants } }))
		},

		setLocalTrack: (localTrack: LocalAudioTrack | undefined) => {
			patchState(store, (state) => ({ ...state, localTrack }))
		},

		addRemoteTrack: (participantIdentity: string, trackPublication: RemoteTrackPublication, muted: boolean) => {
			const remoteParticipants = store.remoteParticipants()
			const remoteParticipant = remoteParticipants[participantIdentity]

			if (remoteParticipant) {
				remoteParticipants[participantIdentity] = { ...remoteParticipant, muted, trackPublication }
			}

			patchState(store, (state) => ({ ...state, remoteParticipants: { ...remoteParticipants } }))
		},

		deleteRemoteTrack: (participantIdentity: string) => {
			const remoteParticipants = store.remoteParticipants()
			const remoteParticipant = remoteParticipants[participantIdentity]

			if (remoteParticipant) {
				remoteParticipants[participantIdentity] = { ...remoteParticipant, trackPublication: undefined }
			}

			patchState(store, (state) => ({ ...state, remoteParticipants: { ...remoteParticipants } }))
		},

		clearRemoteTracks: () => {
			patchState(store, (state) => ({ ...state, remoteTracksMap: {} }))
		},
	})),
	withHooks({
		onDestroy: (store) => {
			store.liveKitRoom()?.disconnect(true)
		},
	}),
)
