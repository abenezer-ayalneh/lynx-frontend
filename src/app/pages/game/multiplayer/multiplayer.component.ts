import { Component, effect, HostListener, OnDestroy, OnInit, signal, viewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { MultiplayerRoomState } from '../../../shared/types/multiplayer-room-state.type'
import { PlayerService } from '../../../shared/services/player.service'
import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { NgClass } from '@angular/common'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { RoundComponent } from '../../../shared/components/round/round.component'
import { CountdownComponent } from '../../../shared/components/countdown/countdown.component'
import { WordBubbleComponent } from '../../../shared/components/word-bubble/word-bubble.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { MatTooltip } from '@angular/material/tooltip'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { CloseGameDialogComponent } from '../../../shared/components/close-game-dialog/close-game-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { FormControl, FormGroup } from '@angular/forms'
import { Word } from '../../../shared/types/word.type'
import { PageState } from '../../../shared/types/page-state.type'
import { Room } from 'colyseus.js'
import { WRONG_GUESS } from '../../../shared/constants/colyseus-message.constant'
import { GameType } from '../../../shared/types/game.type'
import { Subscription } from 'rxjs'

@Component({
	selector: 'app-multiplayer',
	imports: [
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
		LoadingComponent,
		NgClass,
	],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements OnInit, OnDestroy {
	subscriptions$ = new Subscription()

	roomState = signal<MultiplayerRoomState | null>(null)

	pageState = signal<PageState>(PageState.LOADED)

	mic = signal<boolean>(false)

	guessField = viewChild(TextFieldComponent)

	multiplayerPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash }

	wrongGuessAudio = new Audio()

	protected readonly PageState = PageState
	protected readonly GameType = GameType

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly matDialog: MatDialog,
		protected readonly colyseusService: ColyseusService,
	) {
		this.wrongGuessAudio.src = 'audios/wrong-guess.wav'

		effect(() => {
			if (this.roomState()?.gameState) {
				this.focusOnGuessInput()
				this.inputFieldCleanStart()
			}
		})
	}

	ngOnInit() {
		this.joinMultiplayerGame()
	}

	ngOnDestroy() {
		this.subscriptions$.unsubscribe()
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
					this.subscribeToColyseusMessages(room)
					this.initiateVoiceChat(room)

					room.onStateChange((state) => this.roomState.set(state))
					this.pageState.set(PageState.LOADED)
				})
				.catch((e) => {
					this.error = 'Error joining room'
					this.pageState.set(PageState.ERROR)
					console.error(e)
				})
		} else {
			this.error = 'No room id provided'
			this.pageState.set(PageState.LOADED)
		}
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

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.room?.sessionId ?? '') ?? 0
	}

	/**
	 * Submit the guess provided in the attached input field
	 */
	@HostListener('window:keydown.enter', ['$event'])
	submitGuess() {
		const guess = this.multiplayerPlayFormGroup.value.guess

		if (guess) {
			this.multiplayerPlayFormGroup.controls.guess.disable()
			this.colyseusService.sendMessage<{ guess: string }>('guess', { guess })
		}
	}

	/**
	 * Give the input field( the guess field) focus
	 */
	focusOnGuessInput() {
		this.guessField()?.focus()
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	exitGame() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}

	startNewGame() {
		this.colyseusService.room?.send('start-new-game')
	}

	isPlayerGameOwner() {
		return this.roomState()?.ownerId === this.playerService.getPlayer.getValue()?.id
	}

	inputFieldCleanStart() {
		this.multiplayerPlayFormGroup.controls.guess.enable()
		this.multiplayerPlayFormGroup.controls.guess.reset()
		this.focusOnGuessInput()
	}

	toggleMic() {
		this.mic.update((currentMic) => !currentMic)
	}

	private subscribeToColyseusMessages(room: Room<MultiplayerRoomState>) {
		room.onMessage(WRONG_GUESS, () => {
			this.wrongGuessAudio.play()
			this.guessField()?.shake()
			this.inputFieldCleanStart()
		})
	}

	private initiateVoiceChat(room: Room<MultiplayerRoomState>, time = 1000) {
		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			this.mic.set(true)
			const mediaRecorder = new MediaRecorder(stream)
			mediaRecorder.start()

			let audioChunks: Blob[] = []

			mediaRecorder.addEventListener('dataavailable', function (event) {
				audioChunks.push(event.data)
			})

			mediaRecorder.addEventListener('stop', () => {
				const audioBlob = new Blob(audioChunks)

				audioChunks = []

				const fileReader = new FileReader()
				fileReader.readAsDataURL(audioBlob)
				fileReader.onloadend = () => {
					const base64String = fileReader.result

					if (!this.mic()) return

					room.send('talk', base64String)
				}

				mediaRecorder.start()

				setTimeout(() => {
					mediaRecorder.stop()
				}, time)
			})

			setTimeout(() => {
				mediaRecorder.stop()
			}, time)

			room.onMessage('listen', function (data) {
				const audio = new Audio(data)
				audio.play()
			})
		})
	}
}
