import { Component, effect, HostListener, OnDestroy, OnInit, signal, viewChild } from '@angular/core'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { SoloPlayService } from './solo-play.service'
import { GameType } from '../../../shared/types/game.type'
import { Subscription } from 'rxjs'
import { TokenService } from '../../../shared/services/token.service'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { SoloPlayRoomState } from './types/solo-room-state.type'
import { Game } from '../../../shared/models/game.model'
import { Room } from 'colyseus.js'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { RoundComponent } from '../../../shared/components/round/round.component'
import { CountdownComponent } from '../../../shared/components/countdown/countdown.component'
import { Word } from '../../../shared/types/word.type'
import { WordBubbleComponent } from '../../../shared/components/word-bubble/word-bubble.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FormControl, FormGroup } from '@angular/forms'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { MatTooltip } from '@angular/material/tooltip'
import { MatDialog } from '@angular/material/dialog'
import { CloseGameDialogComponent } from '../../../shared/components/close-game-dialog/close-game-dialog.component'
import { NgClass } from '@angular/common'
import { PageState } from '../../../shared/types/page-state.type'
import { GUESS, WRONG_GUESS } from '../../../shared/constants/colyseus-message.constant'

@Component({
	selector: 'app-solo-play',
	imports: [
		LoadingComponent,
		ErrorWhileLoadingComponent,
		GameStartComponent,
		RoundResultComponent,
		GameEndComponent,
		RoundComponent,
		CountdownComponent,
		WordBubbleComponent,
		TextFieldComponent,
		FaIconComponent,
		MatTooltip,
		NgClass,
	],
	templateUrl: './solo-play.component.html',
	styleUrl: './solo-play.component.scss',
})
export class SoloPlayComponent implements OnInit, OnDestroy {
	subscriptions = new Subscription()

	roomState = signal<SoloPlayRoomState | null>(null)

	pageState = signal<PageState>(PageState.LOADED)

	guessField = viewChild(TextFieldComponent)

	soloPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	icons = { faPaperPlane, faTimesCircle }

	protected readonly PageState = PageState

	constructor(
		private readonly soloPlayService: SoloPlayService,
		private readonly tokenService: TokenService,
		private readonly matDialog: MatDialog,
		protected readonly colyseusService: ColyseusService,
	) {
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
	}

	@HostListener('window:keydown.enter', ['$event'])
	submitGuess() {
		const guess = this.soloPlayFormGroup.value.guess

		if (guess) {
			this.soloPlayFormGroup.controls.guess.disable()
			this.colyseusService.sendMessage<{ guess: string }>(GUESS, { guess })
		}
	}

	initSoloPlay() {
		this.subscriptions.add(
			this.soloPlayService.createGame({ type: GameType.SOLO }).subscribe({
				next: (game) => {
					this.createColyseusGame(game)
				},
				error: () => this.pageState.set(PageState.ERROR),
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
				this.pageState.set(PageState.LOADED)
			})
			.catch(() => this.pageState.set(PageState.ERROR))
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

	/**
	 * Exit the currently being played solo game
	 */
	exitSoloPlay() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}

	private subscribeToColyseusMessages(room: Room<SoloPlayRoomState>) {
		room.onMessage(WRONG_GUESS, () => {
			this.guessField()?.shake()
			this.inputFieldCleanStart()
		})
	}
}
