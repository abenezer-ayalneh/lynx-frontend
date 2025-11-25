import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core'
import { Subscription } from 'rxjs'
import { filter, take } from 'rxjs'

import { startCountdown } from '../../utils/timer.util'

@Component({
	selector: 'app-game-start-countdown',
	imports: [],
	templateUrl: './game-start-countdown.component.html',
	styleUrl: './game-start-countdown.component.scss',
})
export class GameStartCountdownComponent implements OnInit, OnDestroy {
	startTime = input.required<string>()

	seconds = signal<number>(NaN)

	minutes = signal<number>(NaN)

	hours = signal<number>(NaN)

	days = signal<number>(NaN)

	whenUnderTenMinutes = output<boolean>()

	whenCountdownEnds = output<boolean>()

	private subscriptions = new Subscription()

	protected readonly isNaN = isNaN

	ngOnInit() {
		this.initiateCountdown()
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe()
	}

	private initiateCountdown(): void {
		const countdownObservable = startCountdown(new Date(this.startTime()))

		this.subscriptions.add(
			countdownObservable.subscribe({
				next: ({ days, hours, minutes, seconds }) => {
					this.days.set(days)
					this.hours.set(hours)
					this.minutes.set(minutes)
					this.seconds.set(seconds)
				},
				complete: () => {
					this.whenCountdownEnds.emit(true)
				},
			}),
		)

		this.subscriptions.add(
			countdownObservable
				.pipe(
					filter(({ days, hours, minutes }) => days === 0 && hours === 0 && minutes < 10),
					take(1),
				)
				.subscribe({
					complete: () => {
						this.whenUnderTenMinutes.emit(true)
					},
				}),
		)
	}
}
