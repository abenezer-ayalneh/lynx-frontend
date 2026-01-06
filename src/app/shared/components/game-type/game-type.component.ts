import { Component, input, output, signal, type WritableSignal } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { Router } from '@angular/router'

import { GameType } from '../../types/game.type'
import { ButtonComponent } from '../button/button.component'

@Component({
	selector: 'app-game-type',
	imports: [ButtonComponent, MatIcon],
	templateUrl: './game-type.component.html',
	styleUrl: './game-type.component.scss',
})
export class GameTypeComponent {
	url = input.required<string>()

	text = input.required<string>()

	gameType = input.required<GameType>()

	instructionToDisplaySignal = input.required<WritableSignal<GameType | null>>()

	showInstructionsClick = output()

	doNotShowAgain = signal(false)

	constructor(private readonly router: Router) {}

	protected readonly GameType = GameType

	private getStorageKey(): string {
		return `hideInstructions-${this.gameType().toLowerCase()}`
	}

	private shouldHideInstructions(): boolean {
		return localStorage.getItem(this.getStorageKey()) === 'true'
	}

	private saveHidePreference() {
		if (this.doNotShowAgain()) {
			localStorage.setItem(this.getStorageKey(), 'true')
		}
	}

	onGameTypeClick() {
		if (this.shouldHideInstructions()) {
			// Skip instructions and go directly to game
			this.router.navigateByUrl(this.url())
		} else {
			// Show instructions
			this.showInstructionsClick.emit()
		}
	}

	closeInstructions() {
		this.instructionToDisplaySignal().set(null)
	}

	readyToPlay() {
		this.saveHidePreference()
		this.closeInstructions()
		this.router.navigateByUrl(this.url())
	}

	shouldShowInstructions(): boolean {
		return this.instructionToDisplaySignal()() === this.gameType()
	}
}
