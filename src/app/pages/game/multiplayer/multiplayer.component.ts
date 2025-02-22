import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ColyseusService } from '../../../shared/services/colyseus.service'
import { MultiplayerRoomState } from '../../../shared/types/multiplayer-room-state.type'
import { PlayerService } from '../../../shared/services/player.service'
import { ErrorWhileLoadingComponent } from '../../../shared/components/error-while-loading/error-while-loading.component'
import { GameStartComponent } from '../../../shared/components/game-start/game-start.component'
import { RoundResultComponent } from '../../../shared/components/round-result/round-result.component'
import { AsyncPipe } from '@angular/common'
import { GameEndComponent } from '../../../shared/components/game-end/game-end.component'
import { RoundComponent } from '../../../shared/components/round/round.component'
import { CountdownComponent } from '../../../shared/components/countdown/countdown.component'
import { WordBubbleComponent } from '../../../shared/components/word-bubble/word-bubble.component'
import { TextFieldComponent } from '../../../shared/components/text-field/text-field.component'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { MatTooltip } from '@angular/material/tooltip'
import { LoadingComponent } from '../../../shared/components/loading/loading.component'
import { CloseGameDialogComponent } from '../../../shared/components/close-game-dialog/close-game-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { FormControl, FormGroup } from '@angular/forms'
import { Word } from '../../../shared/types/word.type'

@Component({
	selector: 'app-multiplayer',
	imports: [
		ErrorWhileLoadingComponent,
		GameStartComponent,
		RoundResultComponent,
		AsyncPipe,
		GameEndComponent,
		RoundComponent,
		CountdownComponent,
		WordBubbleComponent,
		TextFieldComponent,
		FaIconComponent,
		MatTooltip,
		LoadingComponent,
	],
	templateUrl: './multiplayer.component.html',
	styleUrl: './multiplayer.component.scss',
})
export class MultiplayerComponent implements OnInit {
	loaded = signal<boolean>(false)

	multiplayerPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	error: string | null = null

	icons = { faPaperPlane, faTimesCircle }

	constructor(
		private readonly element: ElementRef<HTMLInputElement>,
		private readonly activatedRoute: ActivatedRoute,
		private readonly playerService: PlayerService,
		private readonly matDialog: MatDialog,
		protected readonly colyseusService: ColyseusService,
	) {}

	ngOnInit() {
		this.joinMultiplayerGame()
	}

	joinMultiplayerGame() {
		const roomId = this.activatedRoute.snapshot.params['roomId']

		// Join a websocket room with the gameId
		if (roomId) {
			this.colyseusService.getClient.auth.token = this.playerService.getPlayer.getValue()?.name ?? 'random-name'
			this.colyseusService.getClient
				.joinById<MultiplayerRoomState>(roomId)
				.then((room) => {
					this.colyseusService.setRoom = room

					room.onStateChange((state) => this.colyseusService.multiPlayerRoomState$.next(state))
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
	 * Check if the current player is the winner
	 * @param winnerSessionId
	 */
	isPlayerTheWinner(winnerSessionId: string) {
		return this.colyseusService.getRoom?.sessionId === winnerSessionId
	}

	getPlayerScore(scores: Map<string, number>) {
		return scores.get(this.colyseusService.getRoom?.sessionId ?? '') ?? 0
	}

	getPlayerTotalScore(totalScores: Map<string, number>) {
		return totalScores.get(this.colyseusService.getRoom?.sessionId ?? '') ?? 0
	}

	/**
	 * Submit the guess provided in the attached input field
	 */
	@HostListener('window:keydown.enter', ['$event'])
	submitGuess() {
		const guess = this.multiplayerPlayFormGroup.value.guess

		if (guess) {
			this.colyseusService.sendMessage<{ guess: string }>('guess', { guess })
		}

		this.multiplayerPlayFormGroup.controls.guess.reset()
		this.focusOnGuessInput()
	}

	/**
	 * Give the input field( the guess field) focus
	 */
	focusOnGuessInput() {
		this.element.nativeElement.querySelector('input')?.focus()
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
		this.colyseusService.getRoom?.send('start-new-game')
	}

	isPlayerGameOwner() {
		return 1 === this.playerService.getPlayer.getValue()?.id
	}
}
