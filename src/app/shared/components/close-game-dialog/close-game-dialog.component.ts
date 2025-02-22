import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog'
import { MatButton } from '@angular/material/button'
import { Router } from '@angular/router'
import { ColyseusService } from '../../services/colyseus.service'

@Component({
	selector: 'app-close-game-dialog',
	imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
	templateUrl: './close-game-dialog.component.html',
	styleUrl: './close-game-dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseGameDialogComponent {
	constructor(
		private readonly router: Router,
		private readonly colyseusService: ColyseusService,
	) {}

	async closeGame() {
		this.colyseusService.leaveRoom()
		await this.router.navigateByUrl('home')
	}
}
