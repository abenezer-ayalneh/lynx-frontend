import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { baseUrlInterceptor } from './shared/interceptors/base-url.interceptor'
import { accessTokenInterceptor } from './shared/interceptors/access-token.interceptor'
import { httpErrorsInterceptor } from './shared/interceptors/http-errors.interceptor'

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptors([baseUrlInterceptor, accessTokenInterceptor, httpErrorsInterceptor])),
		provideAnimationsAsync(),
	],
}
