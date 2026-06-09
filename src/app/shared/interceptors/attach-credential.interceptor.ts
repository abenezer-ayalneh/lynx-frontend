import { HttpInterceptorFn } from '@angular/common/http'

export const attachCredentialInterceptor: HttpInterceptorFn = (req, next) => {
	let nextRequest = req

	// const tokenService = inject(TokenService)
	// const accessToken = tokenService.getAccessToken()
	// if (accessToken) {
	// }

	nextRequest = req.clone({
		// headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
		withCredentials: true,
	})

	return next(nextRequest)
}
