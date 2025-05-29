import { Component, input } from '@angular/core'
import { DecimalPipe } from '@angular/common'

@Component({
	selector: 'app-countdown',
  imports: [
    DecimalPipe,
  ],
	templateUrl: './countdown.component.html',
	styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
	time = input.required<number>()
}
