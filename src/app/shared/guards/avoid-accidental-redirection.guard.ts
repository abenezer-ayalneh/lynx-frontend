import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { CanDeactivateFn } from '@angular/router'
import { map } from 'rxjs'

import { CloseGameDialogComponent } from '../components/close-game-dialog/close-game-dialog.component'

export const avoidAccidentalRedirectionGuard: CanDeactivateFn<unknown> = () => {
	const matDialog = inject(MatDialog)

	const matDialogRef = matDialog.open<CloseGameDialogComponent, boolean, boolean>(CloseGameDialogComponent, {
		width: '250px',
	})

	return matDialogRef.afterClosed().pipe(map((result) => Boolean(result)))
}
