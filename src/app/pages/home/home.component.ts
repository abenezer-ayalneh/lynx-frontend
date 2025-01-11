import { Component } from '@angular/core'
import { GameTypeComponent } from '../../shared/components/game-type/game-type.component'

@Component({
	selector: 'app-home',
	imports: [GameTypeComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {}
