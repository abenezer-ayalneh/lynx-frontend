import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { RegisterRequest } from './types/register.type'

@Injectable({
	providedIn: 'root',
})
export class RegisterService {
	constructor(private readonly httpClient: HttpClient) {}

	register(registerRequest: RegisterRequest) {
		return this.httpClient.post<void>('authentication/sign-up', registerRequest)
	}
}
