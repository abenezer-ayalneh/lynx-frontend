import { Component, effect, HostListener, OnDestroy, OnInit, signal, viewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room } from 'colyseus.js'
import { Subscription } from 'rxjs'

import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { GamePlayComponent } from '../../../shared/components/game-play/game-play.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { WRONG_GUESS } from '../../../shared/constants/colyseus-message.constant'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { PlayerService } from '../../../shared/services/player.service'
import { GameType } from '../../../shared/types/game.type'
import { MultiplayerRoomState } from '../../../shared/types/multiplayer-room-state.type'
import { RequestState } from '../../../shared/types/page-state.type'
import { Word } from '../../../shared/types/word.type'
import { MultiplayerService } from './multiplayer.service'

@Component({
	selector: 'app-multiplayer',
	imports: [ErrorWhileLoadingComponent, GameStartComponent, RoundResultComponent, GameEndComponent, LoadingComponent, GamePlayComponent],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements OnInit, OnDestroy {
	subscriptions$ = new Subscription()

	roomState = signal<MultiplayerRoomState | null>(null)

	pageState = signal<RequestState>(RequestState.READY)

	mic = signal<boolean>(false)

	guessField = viewChild(TextFieldComponent)

	multiplayerPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash }

	wrongGuessAudio = new Audio()

	protected readonly PageState = RequestState

	protected readonly GameType = GameType

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly multiplayerService: MultiplayerService,
		protected readonly colyseusService: ColyseusService,
	) {
		this.wrongGuessAudio.src = 'audios/wrong-guess.wav'
		this.wrongGuessAudio.volume = 0.2

		effect(() => {
			const roomState = this.roomState()
			if (roomState) {
				if (this.colyseusService.room?.sessionId && roomState.sessionScore.has(this.colyseusService.room?.sessionId)) {
					this.multiplayerService.sessionScore.set(roomState.sessionScore.get(this.colyseusService.room.sessionId))
				}
			}
		})
	}

	ngOnInit() {
		this.joinMultiplayerGame()
	}

	ngOnDestroy() {
		this.subscriptions$.unsubscribe()
		this.multiplayerService.sessionScore.set(undefined)
		this.mic.set(false)
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

	@HostListener('window:beforeunload', ['$event'])
	unloadNotification(event: BeforeUnloadEvent): void {
		event.preventDefault()
		event.returnValue = 'Are you sure you want to leave?' // For legacy compatability
	}

	@HostListener('window:popstate', ['$event'])
	onPopState(event: PopStateEvent) {
		//Here you can handle your modal
		event.preventDefault()
		event.stopPropagation()
		event.stopImmediatePropagation()
		event.returnValue = false // For legacy compatability
	}

	/**
	 * Give the input field( the guess field) focus
	 */
	focusOnGuessInput() {
		this.guessField()?.focus()
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
