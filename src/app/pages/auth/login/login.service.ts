import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { LoginRequest, LoginResponse } from './types/login.type'

@Injectable({
	providedIn: 'root',
})
export class LoginService {
	constructor(private readonly httpClient: HttpClient) {}

	login(loginRequest: LoginRequest) {
		return this.httpClient.post<LoginResponse>('authentication/sign-in', loginRequest)
	}
}
