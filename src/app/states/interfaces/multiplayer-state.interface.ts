import { Room as ColyseusRoom } from 'colyseus.js'
import { LocalAudioTrack, Room as LiveKitRoom } from 'livekit-client'

import { MicState } from '../../pages/game/multiplayer/types/mic-state.type'
import { Participant } from '../../shared/models/game-player.model'
import { MultiplayerRoomState } from '../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../shared/types/page-state.type'
import { ScheduledGame } from '../../shared/types/scheduled-game.type'

export interface MultiplayerState extends MultiplayerRoomState {
	pageState: RequestState
	micState: MicState
	liveKitRoom: LiveKitRoom | undefined
	colyseusRoom: ColyseusRoom | undefined
	player: null | { name: string }
	remoteParticipants: Record<string, Participant>
	localTrack: LocalAudioTrack | undefined
	error: string | null
	scheduledGame: ScheduledGame | null
}
