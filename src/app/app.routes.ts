import { Routes } from '@angular/router'
import { LoginComponent } from './pages/auth/login/login.component'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { RegisterComponent } from './pages/auth/register/register.component'
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { HomeComponent } from './pages/home/home.component'
import { authGuard } from './shared/guards/auth.guard'
import { SoloPlayComponent } from './pages/game/solo-play/solo-play.component'

export const routes: Routes = [
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
				path: '',
				redirectTo: 'home',
				pathMatch: 'full',
			},
		],
	},
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
]
