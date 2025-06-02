import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RequestPermissionComponent } from './request-permission.component'

describe('RequestPermissionComponent', () => {
	let component: RequestPermissionComponent
	let fixture: ComponentFixture<RequestPermissionComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RequestPermissionComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(RequestPermissionComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
