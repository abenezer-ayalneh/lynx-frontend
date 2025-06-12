import { Component } from '@angular/core'
import { MatButton } from '@angular/material/button'
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog'

@Component({
	selector: 'app-delete-word-dialog',
	imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
	templateUrl: './delete-word-dialog.component.html',
	styleUrl: './delete-word-dialog.component.scss',
})
export class DeleteWordDialogComponent {
	constructor(private readonly dialogRef: MatDialogRef<DeleteWordDialogComponent>) {}

	deleteWord() {
		this.dialogRef.close('delete')
	}
}
