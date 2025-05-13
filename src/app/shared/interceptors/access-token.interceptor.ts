import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'

import { TokenService } from '../services/token.service'

export const accessTokenInterceptor: HttpInterceptorFn = (req, next) => {
	const tokenService = inject(TokenService)

	let nextRequest = req

	const accessToken = tokenService.getAccessToken()

	if (accessToken) {
		nextRequest = req.clone({
			headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
		})
	}

	return next(nextRequest)
}
