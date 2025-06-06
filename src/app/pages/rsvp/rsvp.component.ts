import { DatePipe } from '@angular/common'
import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { finalize, interval, scan, Subscription, take, tap } from 'rxjs'

import { ErrorWhileLoadingComponent } from '../../shared/components/error-while-loading/error-while-loading.component'
import { LoadingComponent } from '../../shared/components/loading/loading.component'
import { RSVP_PAGE_CLOSING_COUNTDOWN_SECONDS } from '../../shared/constants/common.constants'
import { ScheduledGame } from '../../shared/types/scheduled-game.type'
import { RsvpService } from './rsvp.service'

@Component({
	selector: 'app-rsvp',
	imports: [LoadingComponent, ErrorWhileLoadingComponent, DatePipe],
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
						// startCountdown(new Date(scheduledGame.start_time)).subscribe({
						// 	next: ({ days, hours, minutes, seconds }) => {
						// 		this.days.set(days)
						// 		this.hours.set(hours)
						// 		this.minutes.set(minutes)
						// 		this.seconds.set(seconds)
						// 	},
						// })
					},
				})
		} else {
			this.error.set(true)
			this.loaded.set(true)
		}

		interval(1000)
			.pipe(
				tap((value) => this.seconds.set(RSVP_PAGE_CLOSING_COUNTDOWN_SECONDS - value)),
				scan((accumulator) => accumulator - 1, RSVP_PAGE_CLOSING_COUNTDOWN_SECONDS + 1),
				take(RSVP_PAGE_CLOSING_COUNTDOWN_SECONDS + 1),
				// finalize(() => window.close()),
			)
			.subscribe()
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe()
	}
}
