import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { attachCredentialInterceptor } from './shared/interceptors/attach-credential.interceptor'
import { baseUrlInterceptor } from './shared/interceptors/base-url.interceptor'
import { httpErrorsInterceptor } from './shared/interceptors/http-errors.interceptor'

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptors([baseUrlInterceptor, attachCredentialInterceptor, httpErrorsInterceptor])),
		provideAnimationsAsync(),
	],
}
