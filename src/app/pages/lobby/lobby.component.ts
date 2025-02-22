import { AfterViewInit, Component, effect, ElementRef, signal, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { startCountdown } from '../../shared/utils/timer.util'
import { LobbyRoomState } from './types/lobby-room-state.type'
import { ButtonComponent } from '../../shared/components/button/button.component'
import { PlayerService } from '../../shared/services/player.service'
import { Room } from 'colyseus.js'
import { TokenService } from '../../shared/services/token.service'
import { AuthService } from '../auth/auth.service'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'

@Component({
	selector: 'app-lobby',
	imports: [LoadingComponent, ButtonComponent, ReactiveFormsModule, TextFieldComponent],
	templateUrl: './lobby.component.html',
	styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements AfterViewInit {
	loaded = signal<boolean>(false)

	seconds = signal<number>(0)

	minutes = signal<number>(0)

	hours = signal<number>(0)

	days = signal<number>(0)

	countdownEnded = signal<boolean>(false)

	userInformation = signal<{ name: string } | null>(null)

	playerNames = signal<string[]>([])

	usernameFormGroup = new FormGroup({
		username: new FormControl<string>('', { validators: [Validators.required] }),
	})

	room: Room<LobbyRoomState> | null = null

	icons = { faTimesCircle }

	error: string | null = null

	isGameOwner = false

	@ViewChild('usernameModal') usernameModal!: ElementRef

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly colyseusService: ColyseusService,
		private readonly tokenService: TokenService,
		private readonly authService: AuthService,
		private readonly router: Router,
	) {
		effect(() => {
			if (this.userInformation() && this.userInformation()?.name) {
				this.joinLobby()
			}
		})
	}

	ngAfterViewInit(): void {
		this.getUserInformation()
	}

	getUserInformation() {
		const accessToken = this.tokenService.getAccessToken()
		if (accessToken) {
			const playerName = this.playerService.getPlayer.getValue()?.name
			if (playerName) {
				this.userInformation.set({ name: playerName })
				this.loaded.set(true)
			} else {
				this.authService.checkToken().subscribe({
					next: (player) => {
						this.playerService.setPlayer = player
						this.userInformation.set({ name: player.name })
						this.loaded.set(true)
					},
					error: (e) => {
						this.error = 'Player information not found'
						this.loaded.set(true)
						console.error(e)
					},
				})
			}
		} else {
			this.usernameModal?.nativeElement.showModal()
		}
	}

	joinLobby() {
		const roomId = this.activatedRoute.snapshot.queryParams['id']

		// Join a websocket room with the gameId
		if (roomId) {
			this.colyseusService.getClient
				.joinById<LobbyRoomState>(roomId, { player: this.userInformation() })
				.then((room) => {
					this.room = room
					room.onStateChange.once((lobbyState) => {
						this.playerNames.set([...lobbyState.playerNames.values()])
						this.isGameOwner = lobbyState.ownerId === this.playerService.getPlayer.getValue()?.id
						startCountdown(new Date(lobbyState.startTime)).subscribe({
							next: ({ days, hours, minutes, seconds }) => {
								this.days.set(days)
								this.hours.set(hours)
								this.minutes.set(minutes)
								this.seconds.set(seconds)
							},
							complete: () => {
								this.countdownEnded.set(true)
							},
						})
					})

					room.onStateChange((lobbyState) => {
						this.playerNames.set([...lobbyState.playerNames.values()])
					})

					room.onMessage('startGame', ({ roomId }: { roomId: string }) => {
						this.router.navigateByUrl(`/scheduled-game/multi/play/${roomId}`)
					})
					this.loaded.set(true)
				})
				.catch((e) => {
					this.error = 'Error joining room'
					this.loaded.set(true)
					console.error(e)
				})
		} else {
			this.error = 'No room id provided'
			this.loaded.set(true)
		}
	}

	startGame() {
		this.room?.send('startGame', { playerId: this.playerService.getPlayer.getValue()?.id })
	}

	setUsernameInformation() {
		if (this.usernameFormGroup.valid) {
			this.userInformation.set({ name: this.usernameFormGroup.value.username! })
			this.loaded.set(true)
		}
	}
}
