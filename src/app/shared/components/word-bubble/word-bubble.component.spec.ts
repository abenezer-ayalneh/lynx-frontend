import { ComponentFixture, TestBed } from '@angular/core/testing'

import { WordBubbleComponent } from './word-bubble.component'

describe('WordBubbleComponent', () => {
	let component: WordBubbleComponent
	let fixture: ComponentFixture<WordBubbleComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [WordBubbleComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(WordBubbleComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
