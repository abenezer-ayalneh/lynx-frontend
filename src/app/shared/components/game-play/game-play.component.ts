import { NgClass } from '@angular/common'
import { Component, HostListener, input } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltip } from '@angular/material/tooltip'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { ColyseusService } from '../../services/colyseus.service'
import { Word } from '../../types/word.type'
import { CloseGameDialogComponent } from '../close-game-dialog/close-game-dialog.component'
import { CountdownComponent } from '../countdown/countdown.component'
import { RoundComponent } from '../round/round.component'
import { TextFieldComponent } from '../text-field/text-field.component'
import { WordBubbleComponent } from '../word-bubble/word-bubble.component'

@Component({
	selector: 'app-game-play',
	imports: [CountdownComponent, FaIconComponent, MatTooltip, RoundComponent, TextFieldComponent, WordBubbleComponent, NgClass],
	templateUrl: './game-play.component.html',
	styleUrl: './game-play.component.scss',
})
export class GamePlayComponent {
	round = input.required<number>()

	totalRound = input.required<number>()

	time = input.required<number>()

	word = input<Word>()

	icons = { faPaperPlane, faTimesCircle, faMicrophone, faMicrophoneSlash }

	multiplayerPlayFormGroup = new FormGroup({
		guess: new FormControl(''),
	})

	constructor(
		protected readonly colyseusService: ColyseusService,
		private readonly matDialog: MatDialog,
	) {}

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
		const guess = this.multiplayerPlayFormGroup.value.guess

		if (guess) {
			this.colyseusService.sendMessage<{ guess: string }>('guess', { guess })
		}
	}

	/**
	 * Exit the currently being played multiplayer game
	 */
	exitGame() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}
}
