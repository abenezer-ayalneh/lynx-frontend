import { ComponentFixture, TestBed } from '@angular/core/testing'

import { GameTypeComponent } from './game-type.component'

describe('GameTypeComponent', () => {
	let component: GameTypeComponent
	let fixture: ComponentFixture<GameTypeComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GameTypeComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(GameTypeComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
