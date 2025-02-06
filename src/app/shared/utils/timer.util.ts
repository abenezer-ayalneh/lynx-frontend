import { interval, map, takeWhile } from 'rxjs'

export function startCountdown(targetDate: Date) {
	const targetTime = targetDate.getTime()
	return interval(1000).pipe(
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
}
