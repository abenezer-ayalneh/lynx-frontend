import { Component, input } from '@angular/core'

@Component({
	selector: 'app-countdown',
	imports: [],
	templateUrl: './countdown.component.html',
	styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
	time = input.required<number>()
}
