import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ErrorWhileLoadingComponent } from './error-while-loading.component'

describe('ErrorWhileLoadingComponent', () => {
	let component: ErrorWhileLoadingComponent
	let fixture: ComponentFixture<ErrorWhileLoadingComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ErrorWhileLoadingComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(ErrorWhileLoadingComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
