import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { inject } from '@angular/core'
import { SnackbarService } from '../services/snackbar.service'
import FilterResponseInterface from '../interfaces/error-response.interface'
import { TokenService } from '../services/token.service'
import { Router } from '@angular/router'

export const httpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
	const snackbarService = inject(SnackbarService)
	const tokenService = inject(TokenService)
	const router = inject(Router)

	return next(req).pipe(
		catchError((caughtError) => {
			if (caughtError instanceof HttpErrorResponse) {
				if (caughtError.error instanceof ProgressEvent && caughtError.error.type === 'error') {
					snackbarService.showSnackbar('Error: Check your connection!')
				} else if (caughtError.status === 401 && router.routerState.snapshot.url !== '/login') {
					tokenService.clearTokens()
					if (router.routerState.snapshot.url !== '/auth/login') {
						window.location.assign('/auth/login')
					}
				} else {
					const backendError = caughtError.error as FilterResponseInterface

					if (typeof backendError.data === 'object' && typeof (backendError.data as Record<string, string>)['message'] === 'string') {
						snackbarService.showSnackbar((backendError.data as Record<string, string>)['message'])
					} else if (backendError.error) {
						snackbarService.showSnackbar(backendError.error)
					} else {
						snackbarService.showSnackbar('Unexpected error occurred. Please try again.')
					}
				}
			} else {
				snackbarService.showSnackbar('Unexpected error occurred. Please try again.')
			}

			return throwError(() => new Error(caughtError.message))
		}),
	)
}
