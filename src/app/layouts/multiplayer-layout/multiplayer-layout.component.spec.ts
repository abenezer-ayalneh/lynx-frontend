import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MultiplayerLayoutComponent } from './multiplayer-layout.component'

describe('MainLayoutComponent', () => {
	let component: MultiplayerLayoutComponent
	let fixture: ComponentFixture<MultiplayerLayoutComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MultiplayerLayoutComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(MultiplayerLayoutComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
