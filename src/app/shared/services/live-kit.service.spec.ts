import { TestBed } from '@angular/core/testing'

import { LiveKitService } from './live-kit.service'

describe('LiveKitService', () => {
	let service: LiveKitService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(LiveKitService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
