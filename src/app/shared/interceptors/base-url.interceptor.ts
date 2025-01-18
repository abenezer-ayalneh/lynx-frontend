import { HttpInterceptorFn } from '@angular/common/http'
import { environment } from '../../../environments/environment'
import { timeout } from 'rxjs'

const BASE_URL = environment.apiUrl
const TIMEOUT = environment.timeout

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
	const newRequest = req.clone({
		url: `${BASE_URL}/${req.url}`,
	})

	return next(newRequest).pipe(timeout(TIMEOUT))
}
