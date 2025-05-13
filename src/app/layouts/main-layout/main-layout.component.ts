import { Component, ViewEncapsulation } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { HeaderComponent } from '../../shared/components/header/header.component'

@Component({
	selector: 'app-main-layout',
	imports: [RouterOutlet, HeaderComponent],
	templateUrl: './main-layout.component.html',
	styleUrl: './main-layout.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MainLayoutComponent {}
