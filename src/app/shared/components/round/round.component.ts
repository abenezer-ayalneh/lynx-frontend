import { Component, input } from '@angular/core'

@Component({
	selector: 'app-round',
	imports: [],
	templateUrl: './round.component.html',
	styleUrl: './round.component.scss',
})
export class RoundComponent {
	round = input.required<number>()

	totalRound = input.required<number>()
}
