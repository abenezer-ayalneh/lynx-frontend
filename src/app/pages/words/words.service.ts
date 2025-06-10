import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { delay } from 'rxjs'

import { WordDialogComponent } from './components/word-dialog/word-dialog.component'
import CreateWordDto from './dto/create-word.dto'
import FindAllWordsDto from './dto/find-all-words.dto'
import { Word } from './types/words.type'

@Injectable({
	providedIn: 'root',
})
export class WordsService {
	#words = signal<Word[]>([])

	constructor(
		private readonly httpClient: HttpClient,
		private readonly matDialog: MatDialog,
	) {}

	get words() {
		return this.#words()
	}

	set setWords(words: Word[]) {
		this.#words.set(words)
	}

	fetchWords(request: FindAllWordsDto) {
		let params = new HttpParams()
		Object.entries(request).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				params = params.set(key, value)
			}
		})
		return this.httpClient.get<Word[]>('words', { params })
	}

	createWord(word: CreateWordDto) {
		return this.httpClient.post<Word>(`words`, word)
	}

	updateWord(id: number, word: CreateWordDto) {
		return this.httpClient.patch<Word>(`words/${id}`, word)
	}

	deleteWord(id: number) {
		return this.httpClient.delete<Word>(`words/${id}`)
	}

	openAddWordDialog() {
		this.matDialog.open(WordDialogComponent, { data: { type: 'ADD' } })
	}

	openEditWordDialog(word: Word) {
		this.matDialog.open(WordDialogComponent, { data: { type: 'UPDATE', word } })
	}

	closeModals() {
		this.matDialog.closeAll()
	}
}
