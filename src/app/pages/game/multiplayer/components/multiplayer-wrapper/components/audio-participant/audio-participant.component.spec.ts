import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AudioParticipantComponent } from './audio-participant.component'

describe('AudioComponent', () => {
	let component: AudioParticipantComponent
	let fixture: ComponentFixture<AudioParticipantComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AudioParticipantComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(AudioParticipantComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
