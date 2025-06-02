import { Component } from '@angular/core'
import { MatButton } from '@angular/material/button'
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog'

@Component({
	selector: 'app-request-permission',
	imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
	templateUrl: './request-permission.component.html',
	styleUrl: './request-permission.component.scss',
})
export class RequestPermissionComponent {}
