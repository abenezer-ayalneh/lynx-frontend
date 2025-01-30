import { Component } from '@angular/core'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { MatTooltip } from '@angular/material/tooltip'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

@Component({
	selector: 'app-game-rules',
	imports: [FaIconComponent, MatTooltip],
	templateUrl: './game-rules.component.html',
	styleUrl: './game-rules.component.scss',
})
export class GameRulesComponent {
	icons = { faTimesCircle }
}
