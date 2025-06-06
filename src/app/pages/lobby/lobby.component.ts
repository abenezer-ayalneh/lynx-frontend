import { AfterViewInit, Component, effect, ElementRef, signal, ViewChild } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room } from 'colyseus.js'

import { ButtonComponent } from '../../shared/components/button/button.component'
import { ErrorWhileLoadingComponent } from '../../shared/components/error-while-loading/error-while-loading.component'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'
import { ColyseusService } from '../../shared/services/colyseus.service'
import { PlayerService } from '../../shared/services/player.service'
import { TokenService } from '../../shared/services/token.service'
import { startCountdown } from '../../shared/utils/timer.util'
import { AuthService } from '../auth/auth.service'
import { LobbyRoomState } from './types/lobby-room-state.type'

@Component({
	selector: 'app-lobby',
	imports: [ReactiveFormsModule, TextFieldComponent, LoadingComponent, ErrorWhileLoadingComponent, ButtonComponent],
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
		username: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(1)] }),
	})

	room: Room<LobbyRoomState> | null = null

	icons = { faTimesCircle }

	error: string | null = null

	isGameOwner = signal<boolean>(false)

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
						this.isGameOwner.set(lobbyState.ownerId === this.playerService.getPlayer.getValue()?.id)
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
						this.router.navigateByUrl(`/scheduled-game/multi/play/${roomId}?name=${this.userInformation()?.name}`)
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

	async goToLogin() {
		localStorage.setItem('redirectionUrl', this.router.url)
		await this.router.navigate(['auth', 'login'], {
			replaceUrl: false,
			skipLocationChange: true,
			onSameUrlNavigation: 'ignore',
		})
	}

	setUsernameInformation() {
		if (this.usernameFormGroup.valid) {
			this.userInformation.set({ name: this.usernameFormGroup.value.username! })
			this.loaded.set(true)
			this.usernameModal?.nativeElement.close()
		}
	}
}
