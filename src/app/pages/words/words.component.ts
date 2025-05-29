import { Component, OnInit, signal } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { debounce, interval } from 'rxjs'

import { ButtonComponent } from '../../shared/components/button/button.component'
import { TextFieldComponent } from '../../shared/components/text-field/text-field.component'
import { HighlightKeyPipe } from '../../shared/pipes/highlight-key.pipe'
import { RequestState } from '../../shared/types/page-state.type'
import { DEBOUNCE_DELAY, WORDS_PER_INFINITY_LOAD } from './constants/words.constants'
import FindAllWordsDto from './dto/find-all-words.dto'
import { Word } from './types/words.type'
import { WordsService } from './words.service'

@Component({
	selector: 'app-words',
	imports: [TextFieldComponent, HighlightKeyPipe, MatIconButton, MatTooltip, MatIcon, ButtonComponent],
	templateUrl: './words.component.html',
	styleUrl: './words.component.scss',
})
export class WordsComponent implements OnInit {
	pageState = signal<RequestState>(RequestState.LOADING)

	searchQuery = ''

	sort = signal<string | undefined>('updated_at:desc')

	searchControl = new FormControl<string | undefined>('')

	constructor(protected readonly wordsService: WordsService) {}

	ngOnInit() {
		this.fetchWordsEffect({})
		this.subscribeToSearch()
	}

	openAddWordDialog() {
		this.wordsService.openAddWordDialog()
	}

	openEditWordDialog(word: Word) {
		this.wordsService.openEditWordDialog(word)
	}

	onScroll(event: Event) {
		if (this.atBottom(event) && this.wordsService.words.length >= WORDS_PER_INFINITY_LOAD) {
			this.fetchWordsEffect({ lastWordId: this.wordsService.words[this.wordsService.words.length - 1]?.id })
		}
	}

	private fetchWordsEffect({ lastWordId, searchQuery, sort, clearData = false }: FindAllWordsDto & { clearData?: boolean }) {
		this.pageState.set(RequestState.LOADING)
		this.wordsService.fetchWords({ lastWordId, searchQuery, sort }).subscribe({
			next: (words) => {
				this.pageState.set(words.length > 0 ? RequestState.READY : RequestState.EMPTY)
				this.wordsService.setWords = clearData ? words : [...this.wordsService.words, ...words]
			},
			error: () => this.pageState.set(RequestState.ERROR),
		})
	}

	private subscribeToSearch() {
		this.searchControl.valueChanges.pipe(debounce(() => interval(DEBOUNCE_DELAY))).subscribe({
			next: (searchQuery) => {
				if (searchQuery) {
					this.fetchWordsEffect({ searchQuery, clearData: true })
				} else {
					this.fetchWordsEffect({ clearData: true })
				}
			},
		})
	}

	private atBottom(event: Event) {
		const tracker = event.target as HTMLDivElement
		const limit = tracker.scrollHeight - tracker.clientHeight

		return tracker.scrollTop >= limit - 5
	}
}
