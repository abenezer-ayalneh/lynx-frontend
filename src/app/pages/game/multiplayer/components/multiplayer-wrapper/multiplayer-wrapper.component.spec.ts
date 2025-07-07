import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MultiplayerWrapperComponent } from './multiplayer-wrapper.component'

describe('MainLayoutComponent', () => {
	let component: MultiplayerWrapperComponent
	let fixture: ComponentFixture<MultiplayerWrapperComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MultiplayerWrapperComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(MultiplayerWrapperComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
