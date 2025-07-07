import { NgClass } from '@angular/common'
import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core'
import { MatTooltip } from '@angular/material/tooltip'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'

import { Participant } from '../../../../../../../shared/models/game-player.model'
import { PickFirstLettersPipe } from '../../../../../../../shared/pipes/pick-first-letters.pipe'

@Component({
	selector: 'app-audio',
	imports: [FaIconComponent, PickFirstLettersPipe, NgClass, MatTooltip],
	templateUrl: './audio.component.html',
	styleUrl: './audio.component.scss',
})
export class AudioComponent implements OnDestroy {
	participant = input.required<Participant>()

	audioElement = viewChild.required<ElementRef<HTMLAudioElement>>('audioElement')

	onlyOnce = true

	protected readonly faMicrophoneSlash = faMicrophoneSlash

	constructor() {
		effect(() => {
			const participant = this.participant()
			if (this.onlyOnce && participant.trackPublication) {
				this.onlyOnce = false
				participant.trackPublication?.audioTrack?.attach(this.audioElement().nativeElement)
			}
		})
	}

	ngOnDestroy() {
		this.participant().trackPublication?.audioTrack?.detach()
	}
}
