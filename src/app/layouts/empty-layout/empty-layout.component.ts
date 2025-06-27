import { Component, ViewEncapsulation } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
	selector: 'app-empty-layout',
	imports: [RouterOutlet],
	templateUrl: './empty-layout.component.html',
	styleUrl: './empty-layout.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class EmptyLayoutComponent {}
