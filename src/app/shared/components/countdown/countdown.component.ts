import { DecimalPipe } from '@angular/common'
import { Component, input } from '@angular/core'

@Component({
	selector: 'app-countdown',
	imports: [DecimalPipe],
	templateUrl: './countdown.component.html',
	styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
	time = input.required<number>()
}
