import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DeleteWordDialogComponent } from './delete-word-dialog.component'

describe('DeleteWordDialogComponent', () => {
	let component: DeleteWordDialogComponent
	let fixture: ComponentFixture<DeleteWordDialogComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DeleteWordDialogComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(DeleteWordDialogComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
