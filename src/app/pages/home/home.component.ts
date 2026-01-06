import { Component, signal } from '@angular/core'

import { GameTypeComponent } from '../../shared/components/game-type/game-type.component'
import { GameType } from '../../shared/types/game.type'

@Component({
	selector: 'app-home',
	imports: [GameTypeComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	instructionToDisplay = signal<GameType | null>(null)

	protected readonly GameType = GameType

	showInstructions(gameType: GameType) {
		this.instructionToDisplay.set(gameType)
	}
}
