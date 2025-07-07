import { KeyValuePipe } from '@angular/common'
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { firstValueFrom } from 'rxjs'

import { ErrorWhileLoadingComponent } from '../../../../../shared/components/error-while-loading/error-while-loading.component'
import { GameStartCountdownComponent } from '../../../../../shared/components/game-start-countdown/game-start-countdown.component'
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../../../../shared/components/text-field/text-field.component'
import { ColyseusService } from '../../../../../shared/services/colyseus.service'
import { PlayerService } from '../../../../../shared/services/player.service'
import { TokenService } from '../../../../../shared/services/token.service'
import { GameState, MultiplayerRoomState } from '../../../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../../../shared/types/page-state.type'
import { MultiplayerStore } from '../../../../../states/stores/multiplayer.store'
import { AuthService } from '../../../../auth/auth.service'
import { LobbyComponent } from '../../../../lobby/lobby.component'
import { MultiplayerComponent } from '../../multiplayer.component'
import { MultiplayerService } from '../../multiplayer.service'
import { AudioComponent } from './components/audio/audio.component'
import { GameControlComponent } from './components/game-control/game-control.component'

@Component({
	selector: 'app-multiplayer-wrapper',
	imports: [
		LoadingComponent,
		FormsModule,
		TextFieldComponent,
		ReactiveFormsModule,
		ErrorWhileLoadingComponent,
		GameControlComponent,
		LobbyComponent,
		MultiplayerComponent,
		AudioComponent,
		KeyValuePipe,
		GameStartCountdownComponent,
	],
	templateUrl: './multiplayer-wrapper.component.html',
	styleUrl: './multiplayer-wrapper.component.scss',
	providers: [MultiplayerStore],
	encapsulation: ViewEncapsulation.None,
})
export class MultiplayerWrapperComponent implements OnInit, OnDestroy {
	readonly store = inject(MultiplayerStore)

	underTenMinutes = signal<boolean>(false)

	usernameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('usernameModal')

	usernameFormGroup = new FormGroup({
		username: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(1)], nonNullable: true }),
	})

	scheduledGameId: string | null = null

	icons = { faMicrophoneSlash, faMicrophone }

	protected readonly RequestState = RequestState

	protected readonly GameState = GameState

	constructor(
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly tokenService: TokenService,
		private readonly playerService: PlayerService,
		private readonly authService: AuthService,
		private readonly multiplayerService: MultiplayerService,
	) {
		this.initiateEffects()
	}

	async ngOnInit() {
		await this.getUserInformation()
	}

	async ngOnDestroy() {
		this.colyseusService.leaveRoom()
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadConfirmation(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	setUsernameInformation() {
		if (this.usernameFormGroup.valid) {
			this.store.setPlayer(this.usernameFormGroup.controls.username.value)
			this.usernameDialog().nativeElement.close()
		}
	}

	async goToLogin() {
		this.usernameDialog().nativeElement.close()
		localStorage.setItem('redirectionUrl', this.router.url)
		await this.router.navigate(['auth', 'login'], {
			replaceUrl: false,
			skipLocationChange: true,
			onSameUrlNavigation: 'ignore',
		})
	}

	private async getUserInformation() {
		const accessToken = this.tokenService.getAccessToken()
		if (accessToken) {
			const playerName = this.playerService.getPlayer.getValue()?.name
			if (playerName) {
				this.store.setPlayer(playerName)
			} else {
				try {
					const player = await firstValueFrom(this.authService.checkToken())
					this.playerService.setPlayer = player
					this.store.setPlayer(player.name)
				} catch (e) {
					this.store.setError('Player information not found')
					console.error(e)
				}
			}
		} else {
			this.usernameDialog().nativeElement.showModal()
		}
	}

	private initiateGameRoom(playerName: string) {
		const gameId = this.activatedRoute.snapshot.paramMap.get('gameId')
		this.scheduledGameId = gameId

		// Join a websocket room with the gameId
		if (gameId && playerName) {
			firstValueFrom(this.multiplayerService.getScheduledGameById(gameId)).then((game) => {
				this.store.setScheduledGame(game)
				if (game.room_id) {
					this.colyseusService.getClient.auth.token = playerName
					this.colyseusService.getClient
						.joinById<MultiplayerRoomState>(game.room_id, { gameId })
						.then(async (room) => {
							this.colyseusService.setRoom = room
							this.store.setColyseusRoom(room)
							sessionStorage.setItem('reconnectionToken', room.reconnectionToken)

							room.onStateChange((state) => {
								const { players, sessionScore } = state
								this.multiplayerService.sessionScore.set(sessionScore.get(room.sessionId))
								this.store.reflectGameStateChange(state)
								this.store.updateRemoteParticipants(players)
							})

							this.store.setPageState(RequestState.READY)
						})
						.catch((e) => {
							this.store.setError('Error joining room')
							console.error(e)
						})
				} else {
					this.store.setError("Couldn't join game")
				}
			})
		} else {
			this.store.setError('No room id provided')
		}
	}

	private initiateEffects() {
		effect(() => {
			const player = this.store.player()

			if (player) {
				this.initiateGameRoom(player.name)
			}
		})
	}
}
