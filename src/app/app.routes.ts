import { Routes } from '@angular/router'
import { LoginComponent } from './pages/auth/login/login.component'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { RegisterComponent } from './pages/auth/register/register.component'
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { HomeComponent } from './pages/home/home.component'
import { authGuard } from './shared/guards/auth.guard'
import { SoloPlayComponent } from './pages/game/solo-play/solo-play.component'
import { MultiplayerComponent } from './pages/game/multiplayer/multiplayer.component'
import { CreateMultiplayerGameComponent } from './pages/game/multiplayer/components/create-multiplayer-game/create-multiplayer-game.component'
import { RsvpComponent } from './pages/rsvp/rsvp.component'

export const routes: Routes = [
	{
		path: 'auth',
		component: AuthLayoutComponent,
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
		path: 'rsvp',
		component: AuthLayoutComponent,
		children: [
			{
				path: '',
				component: RsvpComponent,
			},
		],
	},
	{
		path: '',
		component: MainLayoutComponent,
		canActivate: [authGuard],
		children: [
			{
				path: 'home',
				component: HomeComponent,
			},
			{
				path: 'solo',
				component: SoloPlayComponent,
			},
			{
				path: 'multi/create-room',
				component: CreateMultiplayerGameComponent,
			},
			{
				path: 'multi',
				component: MultiplayerComponent,
			},
			{
				path: '',
				redirectTo: 'home',
				pathMatch: 'full',
			},
		],
	},
]
