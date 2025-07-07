import { Component, effect, HostListener, OnDestroy, OnInit, signal, viewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatTooltip } from '@angular/material/tooltip'
import { Router } from '@angular/router'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room } from 'colyseus.js'
import { Subscription } from 'rxjs'

import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { GamePlayComponent } from '../../../shared/components/game-play/game-play.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { GUESS, WRONG_GUESS } from '../../../shared/constants/colyseus-message.constant'
import { Game } from '../../../shared/models/game.model'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { TokenService } from '../../../shared/services/token.service'
import { GameType } from '../../../shared/types/game.type'
import { RequestState } from '../../../shared/types/page-state.type'
import { Word } from '../../../shared/types/word.type'
import { SoloPlayService } from './solo-play.service'
import { SoloPlayRoomState } from './types/solo-room-state.type'

@Component({
	selector: 'app-solo-play',
	imports: [
		LoadingComponent,
		ErrorWhileLoadingComponent,
		GameStartComponent,
		RoundResultComponent,
		GameEndComponent,
		GamePlayComponent,
		FaIconComponent,
		MatTooltip,
	],
	templateUrl: './solo-play.component.html',
	styleUrl: './solo-play.component.scss',
})
export class SoloPlayComponent implements OnInit, OnDestroy {
	subscriptions = new Subscription()

	roomState = signal<SoloPlayRoomState | null>(null)

	pageState = signal<RequestState>(RequestState.READY)

	guessField = viewChild(TextFieldComponent)

	soloPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	icons = { faPaperPlane, faTimesCircle }

	wrongGuessAudio = new Audio()

	protected readonly PageState = RequestState

	protected readonly GameType = GameType

	constructor(
		private readonly soloPlayService: SoloPlayService,
		private readonly tokenService: TokenService,
		private readonly router: Router,
		protected readonly colyseusService: ColyseusService,
	) {
		this.wrongGuessAudio.src = 'audios/wrong-guess.wav'
		this.wrongGuessAudio.volume = 0.02

		effect(() => {
			if (this.roomState()?.gameState) {
				this.focusOnGuessInput()
				this.inputFieldCleanStart()
			}
		})
	}

	ngOnInit() {
		this.initSoloPlay()
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe()
		this.colyseusService.leaveRoom()
	}

	@HostListener('window:keydown.enter', ['$event'])
	submitGuess() {
		const guess = this.soloPlayFormGroup.value.guess

		if (guess) {
			this.soloPlayFormGroup.controls.guess.disable()
			this.colyseusService.sendMessage<{ guess: string }>(GUESS, { guess })
		}
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadNotification(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	initSoloPlay() {
		this.subscriptions.add(
			this.soloPlayService.createGame({ type: GameType.SOLO }).subscribe({
				next: (game) => {
					this.createColyseusGame(game)
				},
				error: () => this.pageState.set(RequestState.ERROR),
			}),
		)
	}

	createColyseusGame(game: Game) {
		// Pass the access token to be validated by the colyseus onAuth method
		this.colyseusService.getClient.auth.token = this.tokenService.getAccessToken() ?? 'no-access-token'

		this.colyseusService.getClient
			.create<SoloPlayRoomState>('solo', {
				gameId: game.id,
				gameType: game.type,
			})
			.then((soloPlayRoomStateRoom: Room<SoloPlayRoomState>) => {
				this.colyseusService.setRoom = soloPlayRoomStateRoom
				this.subscribeToColyseusMessages(soloPlayRoomStateRoom)
				soloPlayRoomStateRoom.onStateChange((state) => this.roomState.set(state))
				this.pageState.set(RequestState.READY)
			})
			.catch(() => this.pageState.set(RequestState.ERROR))
	}

	/**
	 * Return words that have true value for the shown attribute
	 * @param word
	 */
	getVisibleWords(word: Word | undefined) {
		if (word) {
			return word.cues.filter((cue) => cue.shown)
		}

		return []
	}

	/**
	 * Give the input field( the guess field) focus
	 */
	focusOnGuessInput() {
		this.guessField()?.focus()
	}

	inputFieldCleanStart() {
		this.soloPlayFormGroup.controls.guess.enable()
		this.soloPlayFormGroup.controls.guess.reset()
		this.focusOnGuessInput()
	}

	async exit() {
		await this.router.navigateByUrl('home')
	}

	private subscribeToColyseusMessages(room: Room<SoloPlayRoomState>) {
		room.onMessage(WRONG_GUESS, () => {
			this.wrongGuessAudio.play()
			this.guessField()?.shake()
			this.inputFieldCleanStart()
		})
	}
}
