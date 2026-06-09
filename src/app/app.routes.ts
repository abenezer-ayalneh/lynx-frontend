import { Routes } from '@angular/router'

import { authGuard } from './shared/guards/auth.guard'
import { avoidAccidentalRedirectionGuard } from './shared/guards/avoid-accidental-redirection.guard'
import { optionalAuthGuardGuard } from './shared/guards/optional-auth-guard.guard'

export const routes: Routes = [
	{
		path: 'auth',
		loadComponent: () => import('./layouts/empty-layout/empty-layout.component').then((m) => m.EmptyLayoutComponent),
		children: [
			{
				path: 'login',
				loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
			},
			{
				path: 'register',
				loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
			},
			{
				path: 'forgot-password',
				loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
			},
			{
				path: 'reset-password',
				loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
			},
		],
	},
	{
		path: 'home',
		loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
		canActivate: [authGuard],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
			},
		],
	},
	{
		path: 'game',
		loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
		children: [
			{
				path: 'solo',
				loadComponent: () => import('./pages/game/solo-play/solo-play.component').then((m) => m.SoloPlayComponent),
				canActivate: [authGuard],
				canDeactivate: [avoidAccidentalRedirectionGuard],
			},
			{
				path: 'scheduled',
				children: [
					{
						path: 'create',
						loadComponent: () =>
							import('./pages/game/multiplayer/components/create-multiplayer-game/create-multiplayer-game.component').then(
								(m) => m.CreateMultiplayerGameComponent,
							),
						canActivate: [authGuard],
					},
					{
						path: ':gameId',
						loadComponent: () =>
							import('./pages/game/multiplayer/components/multiplayer-wrapper/multiplayer-wrapper.component').then(
								(m) => m.MultiplayerWrapperComponent,
							),
						canActivate: [optionalAuthGuardGuard],
						canDeactivate: [avoidAccidentalRedirectionGuard],
					},
				],
			},
		],
	},
	{
		path: 'words',
		loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
		canActivate: [authGuard],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/words/words.component').then((m) => m.WordsComponent),
			},
		],
	},
	{
		path: '',
		redirectTo: 'auth/login',
		pathMatch: 'full',
	},
	{
		path: '**',
		redirectTo: 'home',
	},
]
