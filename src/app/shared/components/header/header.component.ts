import { Component, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '../../../pages/auth/auth.service'
import { Player } from '../../models/player.model'
import { PlayerService } from '../../services/player.service'

@Component({
	selector: 'app-header',
	imports: [RouterLink],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent {
	player = signal<Player | null>(null)

	constructor(
		private readonly authService: AuthService,
		private readonly playerService: PlayerService,
	) {
		this.playerService.getPlayer.subscribe((player) => this.player.set(player))
	}

	async logout() {
		await this.authService.logOut()
	}
}
