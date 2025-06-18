import { AfterViewInit, Component, computed, effect, inject, OnDestroy, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faExclamation, faMicrophone, faMicrophoneSlash, faPaperPlane, faPause, faPlay, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Subscription } from 'rxjs'

import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { GamePlayComponent } from '../../../shared/components/game-play/game-play.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { PlayerService } from '../../../shared/services/player.service'
import { GameType } from '../../../shared/types/game.type'
import { GamePlayStatus, MultiplayerRoomState } from '../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../shared/types/page-state.type'
import { MultiplayerStore } from '../../../states/stores/multiplayer.store'
import { MultiplayerService } from './multiplayer.service'

@Component({
	selector: 'app-multiplayer',
	imports: [ErrorWhileLoadingComponent, GameStartComponent, RoundResultComponent, GameEndComponent, LoadingComponent, GamePlayComponent, FaIconComponent],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements AfterViewInit, OnDestroy {
	subscriptions$ = new Subscription()

	readonly store = inject(MultiplayerStore)

	roomState = signal<MultiplayerRoomState | null>(null)

	pageState = signal<RequestState>(RequestState.READY)

	isPlayerGameOwner = computed(() => this.roomState()?.ownerId === this.playerService.getPlayer.getValue()?.id)

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash, faTimes, faExclamation, faPause, faPlay }

	protected readonly PageState = RequestState

	protected readonly GameType = GameType

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly multiplayerService: MultiplayerService,
		protected readonly colyseusService: ColyseusService,
	) {
		effect(() => {
			const roomState = this.roomState()
			if (roomState) {
				if (this.colyseusService.room?.sessionId && roomState.sessionScore.has(this.colyseusService.room?.sessionId)) {
					this.multiplayerService.sessionScore.set(roomState.sessionScore.get(this.colyseusService.room.sessionId))
				}
			}
		})
	}

	ngAfterViewInit() {
		this.joinMultiplayerGame()
	}

	ngOnDestroy() {
		this.colyseusService.leaveRoom()
		this.subscriptions$.unsubscribe()
		this.multiplayerService.sessionScore.set(undefined)
	}

	joinMultiplayerGame() {
		const roomId = this.activatedRoute.snapshot.params['roomId']
		const name = this.activatedRoute.snapshot.queryParams['name']

		// Join a websocket room with the gameId
		if (roomId && name) {
			this.colyseusService.getClient.auth.token = name
			this.colyseusService.getClient
				.joinById<MultiplayerRoomState>(roomId)
				.then((room) => {
					this.colyseusService.setRoom = room
					sessionStorage.setItem('reconnectionToken', room.reconnectionToken)

					room.onStateChange((state) => this.roomState.set({ ...state }))
					this.pageState.set(RequestState.READY)
				})
				.catch((e) => {
					this.error = 'Error joining room'
					this.pageState.set(RequestState.ERROR)
					console.error(e)
				})
		} else {
			this.error = 'No room id provided'
			this.pageState.set(RequestState.READY)
		}
	}

	reconnect() {
		const reconnectionToken = sessionStorage.getItem('reconnectionToken')
		if (reconnectionToken && this.colyseusService.getClient) {
			this.colyseusService.getClient
				.reconnect<MultiplayerRoomState>(reconnectionToken)
				.then((room) => (this.colyseusService.setRoom = room))
				.catch((error) => console.error('join error', error))
		}
	}

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.room?.sessionId ?? '') ?? 0
	}

	startNewGame() {
		this.colyseusService.room?.send('start-new-game')
	}

	protected readonly GamePlayStatus = GamePlayStatus
}
