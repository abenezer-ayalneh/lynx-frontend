import { Component, input, output } from '@angular/core'
import { ButtonComponent } from '../button/button.component'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { MatTooltip } from '@angular/material/tooltip'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { CloseGameDialogComponent } from '../close-game-dialog/close-game-dialog.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
	selector: 'app-game-end',
	imports: [ButtonComponent, FaIconComponent, MatTooltip],
	templateUrl: './game-end.component.html',
	styleUrl: './game-end.component.scss',
})
export class GameEndComponent {
	totalScore = input.required<number>()

	playNewGameClicked = output()

	icons = { faTimesCircle }

	constructor(private readonly matDialog: MatDialog) {}

	/**
	 * Start a new game
	 */
	playNewGame() {
		this.playNewGameClicked.emit()
	}

	/**
	 * Exit the currently being played solo game
	 */
	exitSoloPlay() {
		this.matDialog.open(CloseGameDialogComponent, {
			width: '250px',
		})
	}
}
