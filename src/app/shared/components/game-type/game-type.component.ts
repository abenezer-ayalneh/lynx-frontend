import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-game-type',
	imports: [RouterLink],
	templateUrl: './game-type.component.html',
	styleUrl: './game-type.component.scss',
})
export class GameTypeComponent {
	url = input.required<string>()

	text = input.required<string>()
}
