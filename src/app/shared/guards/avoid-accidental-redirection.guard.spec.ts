import { TestBed } from '@angular/core/testing'
import { CanDeactivateFn } from '@angular/router'

import { avoidAccidentalRedirectionGuard } from './avoid-accidental-redirection.guard'

describe('avoidAccidentalRedirectionGuard', () => {
	const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
		TestBed.runInInjectionContext(() => avoidAccidentalRedirectionGuard(...guardParameters))

	beforeEach(() => {
		TestBed.configureTestingModule({})
	})

	it('should be created', () => {
		expect(executeGuard).toBeTruthy()
	})
})
