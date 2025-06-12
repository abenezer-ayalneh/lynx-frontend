import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatButton } from '@angular/material/button'
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog'


@Component({
	selector: 'app-close-game-dialog',
	imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
	templateUrl: './close-game-dialog.component.html',
	styleUrl: './close-game-dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseGameDialogComponent {
	constructor(private readonly matDialogRef: MatDialogRef<CloseGameDialogComponent>) {}

	async closeGame() {
		this.matDialogRef.close(true)
	}
}
