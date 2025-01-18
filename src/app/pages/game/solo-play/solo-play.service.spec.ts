import { TestBed } from '@angular/core/testing'

import { SoloPlayService } from './solo-play.service'

describe('SoloPlayService', () => {
	let service: SoloPlayService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(SoloPlayService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
