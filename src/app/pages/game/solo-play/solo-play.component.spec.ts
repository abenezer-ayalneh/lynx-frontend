import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SoloPlayComponent } from './solo-play.component'

describe('SoloPlayComponent', () => {
	let component: SoloPlayComponent
	let fixture: ComponentFixture<SoloPlayComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SoloPlayComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(SoloPlayComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
