import { Component, input } from '@angular/core'

@Component({
	selector: 'app-game-start',
	imports: [],
	templateUrl: './game-start.component.html',
	styleUrl: './game-start.component.scss',
})
export class GameStartComponent {
	waitingCountdownTime = input.required<number>()
}
