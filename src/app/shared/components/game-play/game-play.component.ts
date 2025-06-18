import { NgClass } from '@angular/common'
import { AfterViewInit, Component, ElementRef, HostListener, input, OnInit, signal, viewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Room } from 'colyseus.js'

import { WRONG_GUESS } from '../../constants/colyseus-message.constant'
import { ColyseusService } from '../../services/colyseus.service'
import { MultiplayerRoomState } from '../../types/multiplayer-room-state.type'
import { Word } from '../../types/word.type'
import { CountdownComponent } from '../countdown/countdown.component'
import { RoundComponent } from '../round/round.component'
import { WordBubbleComponent } from '../word-bubble/word-bubble.component'

@Component({
	selector: 'app-game-play',
	imports: [CountdownComponent, FaIconComponent, RoundComponent, WordBubbleComponent, NgClass, ReactiveFormsModule],
	templateUrl: './game-play.component.html',
	styleUrl: './game-play.component.scss',
})
export class GamePlayComponent implements OnInit, AfterViewInit {
	round = input.required<number>()

	totalRound = input.required<number>()

	time = input.required<number>()

	word = input<Word | null>()

	guessing = signal<boolean>(false)

	guessField = viewChild.required<ElementRef<HTMLInputElement>>('inputField')

	shouldShake = signal<boolean>(false)

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash }

	guessFormControl = new FormControl<string>('')

	wrongGuessAudio = new Audio()

	constructor(protected readonly colyseusService: ColyseusService) {
		this.wrongGuessAudio.src = 'audios/wrong-guess.wav'
		this.wrongGuessAudio.volume = 0.02
	}

	ngOnInit() {
		if (this.colyseusService.room) {
			this.subscribeToColyseusMessages(this.colyseusService.room)
		}
	}

	ngAfterViewInit() {
		this.guessField().nativeElement.focus()
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
	 * Submit the guess provided in the attached input field
	 */
	@HostListener('window:keydown.enter', ['$event'])
	submitGuess() {
		const guess = this.guessFormControl.value

		if (guess) {
			this.guessing.set(true)
			this.colyseusService.sendMessage<{ guess: string }>('guess', { guess })
		}
	}

	shakeInputField() {
		this.shouldShake.set(true)

		setTimeout(() => {
			this.shouldShake.set(false)
		}, 1500)
	}

	private inputFieldCleanStart() {
		this.guessFormControl.enable()
		this.guessFormControl.reset()
	}

	private subscribeToColyseusMessages(room: Room<MultiplayerRoomState>) {
		room.onMessage(WRONG_GUESS, () => {
			this.wrongGuessAudio.play().then(() => {
				this.guessing.set(false)
				this.shakeInputField()
				this.guessField().nativeElement.focus()
				this.guessField().nativeElement.select()
			})
		})
	}
}
