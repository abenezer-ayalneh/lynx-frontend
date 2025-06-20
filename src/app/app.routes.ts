import { Routes } from '@angular/router'

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { MultiplayerLayoutComponent } from './layouts/multiplayer-layout/multiplayer-layout.component'
import { LoginComponent } from './pages/auth/login/login.component'
import { RegisterComponent } from './pages/auth/register/register.component'
import { CreateMultiplayerGameComponent } from './pages/game/multiplayer/components/create-multiplayer-game/create-multiplayer-game.component'
import { SoloPlayComponent } from './pages/game/solo-play/solo-play.component'
import { HomeComponent } from './pages/home/home.component'
import { RsvpComponent } from './pages/rsvp/rsvp.component'
import { WordsComponent } from './pages/words/words.component'
import { authGuard } from './shared/guards/auth.guard'
import { avoidAccidentalRedirectionGuard } from './shared/guards/avoid-accidental-redirection.guard'
import { optionalAuthGuardGuard } from './shared/guards/optional-auth-guard.guard'

export const routes: Routes = [
	{
		path: 'auth',
		component: MainLayoutComponent,
		children: [
			{
				path: 'login',
				component: LoginComponent,
			},
			{
				path: 'register',
				component: RegisterComponent,
			},
		],
	},
	{
		path: 'home',
		component: MainLayoutComponent,
		canActivate: [authGuard],
		children: [
			{
				path: '',
				component: HomeComponent,
			},
			{
				path: 'solo',
				component: SoloPlayComponent,
				canDeactivate: [avoidAccidentalRedirectionGuard],
			},
			{
				path: 'multi/create-room',
				component: CreateMultiplayerGameComponent,
			},
		],
	},
	{
		path: 'scheduled-game',
		component: MainLayoutComponent,
		canActivate: [optionalAuthGuardGuard],
		canDeactivate: [avoidAccidentalRedirectionGuard],
		children: [
			{
				path: 'rsvp',
				component: RsvpComponent,
			},
			{
				path: ':gameId/:roomId',
				component: MultiplayerLayoutComponent,
			},
		],
	},
	{
		path: 'words',
		component: MainLayoutComponent,
		canActivate: [authGuard],
		children: [
			{
				path: '',
				component: WordsComponent,
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
		redirectTo: 'auth/login',
	},
]
