import { Injectable } from '@angular/core'

@Injectable({
	providedIn: 'root',
})
export class PreloadService {
	imageCache: Record<string, HTMLImageElement> = {}

	audioCache: Record<string, HTMLAudioElement> = {}

	preloadImages(imageUrls: string[]): Promise<void[]> {
		return Promise.all(imageUrls.map((url) => this.loadImage(url)))
	}

	preloadAudios(audioUrls: string[]): Promise<void[]> {
		return Promise.all(audioUrls.map((url) => this.loadAudio(url)))
	}

	private loadImage(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.imageCache[url]) {
				resolve()
				return
			}
			const image = new Image()
			image.src = url
			image.onload = () => {
				this.imageCache[url] = image
				resolve()
			}
			image.onerror = () => {
				reject()
			}
		})
	}

	private loadAudio(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.audioCache[url]) {
				resolve()
				return
			}
			const audio = new Audio()
			audio.src = url
			audio.onload = () => {
				this.audioCache[url] = audio
				resolve()
			}
			audio.onerror = () => {
				reject()
			}
		})
	}
}
