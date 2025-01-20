import { Injectable } from '@angular/core'
import { Player } from '../models/player.model'
import { BehaviorSubject } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class PlayerService {
	private player = new BehaviorSubject<Player | null>(null)

	get getPlayer() {
		return this.player
	}

	set setPlayer(player: Player) {
		this.player.next(player)
	}

	setPlayerScore(score: number) {
		const player = this.player.getValue()

		if (player) {
			this.player.next({
				...player,
				score,
			})
		}
	}
}
