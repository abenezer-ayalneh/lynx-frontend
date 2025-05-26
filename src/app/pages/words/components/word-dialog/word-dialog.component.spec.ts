import { ComponentFixture, TestBed } from '@angular/core/testing'

import { WordDialogComponent } from './word-dialog.component'

describe('EditWordComponent', () => {
	let component: WordDialogComponent
	let fixture: ComponentFixture<WordDialogComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [WordDialogComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(WordDialogComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
