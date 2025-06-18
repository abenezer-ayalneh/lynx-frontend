import { Room as ColyseusRoom } from 'colyseus.js'
import { Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { GamePlayer } from '../../shared/models/game-player.model'
import { MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'

export interface MultiplayerState extends MultiplayerRoomState {
	pageState: RequestState
	micState: MicState
	liveKitRoom: LiveKitRoom | null
	colyseusRoom: ColyseusRoom | null
	player: null | { name: string }
	gamePlayers: GamePlayer[]
	error: string | null
}
