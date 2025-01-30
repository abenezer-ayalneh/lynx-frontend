import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { RsvpService } from './rsvp.service'
import { finalize, interval, map, Subscription, takeWhile } from 'rxjs'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { ScheduledGame } from '../../shared/types/scheduled-game.type'

@Component({
	selector: 'app-rsvp',
	imports: [LoadingComponent],
	templateUrl: './rsvp.component.html',
	styleUrl: './rsvp.component.scss',
})
export class RsvpComponent implements OnInit, OnDestroy {
	subscriptions = new Subscription()

	loaded = signal<boolean>(false)

	error = signal<boolean>(false)

	scheduledGame = signal<ScheduledGame | null>(null)

	seconds = signal<number>(0)

	minutes = signal<number>(0)

	hours = signal<number>(0)

	days = signal<number>(0)

	icons = { faTimesCircle }

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly rsvpService: RsvpService,
	) {}

	ngOnInit() {
		const email = this.activatedRoute.snapshot.queryParams['email']
		const gameId = this.activatedRoute.snapshot.queryParams['gameId']

		if (email && gameId) {
			this.rsvpService
				.rsvp(email, gameId)
				.pipe(finalize(() => this.loaded.set(true)))
				.subscribe({
					next: (scheduledGame) => {
						this.scheduledGame.set(scheduledGame)
						this.startCountdown(new Date(scheduledGame.start_time))
					},
				})
		} else {
			this.error.set(true)
			this.loaded.set(true)
		}
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe()
	}

	private startCountdown(targetDate: Date) {
		const targetTime = targetDate.getTime()
		this.subscriptions.add(
			interval(1000)
				.pipe(
					map(() => {
						const now = new Date().getTime()
						const distance = targetTime - now

						if (distance <= 0) {
							return { days: 0, hours: 0, minutes: 0, seconds: 0 }
						}

						const days = Math.floor(distance / (1000 * 60 * 60 * 24))
						const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
						const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
						const seconds = Math.floor((distance % (1000 * 60)) / 1000)

						return { days, hours, minutes, seconds }
					}),
					takeWhile(({ days, hours, minutes, seconds }) => days > 0 || hours > 0 || minutes > 0 || seconds > 0),
				)
				.subscribe({
					next: ({ days, hours, minutes, seconds }) => {
						this.days.set(days)
						this.hours.set(hours)
						this.minutes.set(minutes)
						this.seconds.set(seconds)
					},
				}),
		)
	}
}
