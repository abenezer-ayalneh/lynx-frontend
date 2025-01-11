import { Routes } from '@angular/router'
import { LoginComponent } from './pages/auth/login/login.component'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { RegisterComponent } from './pages/auth/register/register.component'

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
		path: '',
		redirectTo: 'auth/login',
		pathMatch: 'full',
	},
]
