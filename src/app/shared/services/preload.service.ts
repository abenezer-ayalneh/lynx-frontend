import { Injectable } from '@angular/core'

@Injectable({
	providedIn: 'root',
})
export class PreloadService {
	preloadedCache: Record<string, HTMLImageElement> = {}

	preloadImages(imageUrls: string[]): Promise<void[]> {
		return Promise.all(imageUrls.map((url) => this.loadImage(url)))
	}

	private loadImage(url: string): Promise<void> {
		return new Promise((resolve) => {
			if (this.preloadedCache[url]) {
				resolve()
				return
			}
			const image = new Image()
			image.src = url
			image.onload = () => {
				this.preloadedCache[url] = image
				resolve()
			}
			// image.onerror = () => {
			//   reject()
			// }
		})
	}
}
