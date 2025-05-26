import { Component, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'

import { AuthService } from '../../../pages/auth/auth.service'
import { MultiplayerService } from '../../../pages/game/multiplayer/multiplayer.service'
import { Player, Role } from '../../models/player.model'
import { PlayerService } from '../../services/player.service'

@Component({
	selector: 'app-header',
	imports: [RouterLink],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent {
	player = signal<Player | null>(null)

	protected readonly Role = Role

	constructor(
		private readonly authService: AuthService,
		private readonly playerService: PlayerService,
		private readonly router: Router,
		protected readonly multiplayerService: MultiplayerService,
	) {
		this.playerService.getPlayer.subscribe((player) => this.player.set(player))
	}

	async logout() {
		await this.authService.logOut()
	}

	async manageWords() {
		await this.router.navigateByUrl('words')
	}
}
