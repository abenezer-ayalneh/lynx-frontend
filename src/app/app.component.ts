import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { PreloadService } from './shared/services/preload.service'

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
	private imageUrls = [
		'audios/brass-end-of-game-results.mp3',
		'audios/trumpet-all-fail-round.mp3',
		'audios/trumpet-solved-round.mp3',
		'audios/wrong-guess.wav',
		'images/logos/lynx-logo.png',
		'images/logos/lynx-logo.svg',
		'images/logos/profile-image-sample.svg',
		'images/auth-image.png',
		'images/coming-soon.png',
		'images/cue-word-balloon.svg',
	]

	constructor(private readonly preloadService: PreloadService) {}

	ngOnInit(): void {
		this.preloadService.preloadImages(this.imageUrls)
	}
}
