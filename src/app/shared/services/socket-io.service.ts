import { Injectable } from '@angular/core'
import { io, Socket } from 'socket.io-client'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

const SOCKET_URL = environment.socketUrl

@Injectable({
	providedIn: 'root',
})
export class SocketIoService {
	private socket: Socket

	constructor() {
		this.socket = io(SOCKET_URL)
	}

	emit(event: string, data: object) {
		this.socket.emit(event, data)
	}

	on(event: string): Observable<object> {
		return new Observable((observer) => {
			this.socket.on(event, (data) => {
				observer.next(data)
			})

			// Handle cleanup
			return () => {
				this.socket.off(event)
			}
		})
	}
}
