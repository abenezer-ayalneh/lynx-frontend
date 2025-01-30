import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateMultiplayerGameComponent } from './create-multiplayer-game.component'

describe('CreateMultiplayerGameComponent', () => {
	let component: CreateMultiplayerGameComponent
	let fixture: ComponentFixture<CreateMultiplayerGameComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CreateMultiplayerGameComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(CreateMultiplayerGameComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
