import { Component } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { NgOptimizedImage } from '@angular/common'

@Component({
	selector: 'app-auth-layout',
	imports: [RouterOutlet, NgOptimizedImage, RouterLink],
	templateUrl: './auth-layout.component.html',
	styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
