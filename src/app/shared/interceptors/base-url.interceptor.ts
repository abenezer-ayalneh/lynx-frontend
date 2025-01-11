import { HttpInterceptorFn } from '@angular/common/http'
import { environment } from '../../../environments/environment'

const BASE_URL = environment.apiUrl

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
	const newRequest = req.clone({
		url: `${BASE_URL}/${req.url}`,
	})

	return next(newRequest)
}
