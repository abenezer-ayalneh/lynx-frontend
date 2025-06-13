import { Room } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { GameStatus } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'

export interface MultiplayerState {
	pageState: RequestState
	micState: MicState
	gameStatus: GameStatus
	liveKitRoom: Room | null
}
