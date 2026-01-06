import { AfterViewInit, Component, ElementRef, OnInit, signal, viewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { MatProgressBar } from '@angular/material/progress-bar'
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
	imports: [MatIcon, HighlightKeyPipe, MatIconButton, MatTooltip, ButtonComponent, TextFieldComponent, MatProgressBar, ButtonComponent],
	templateUrl: './words.component.html',
	styleUrl: './words.component.scss',
})
export class WordsComponent implements OnInit, AfterViewInit {
	pageState = signal<RequestState>(RequestState.LOADING)

	sortState = signal<'none' | 'asc' | 'desc'>('none')

	offset = signal<number>(0)

	intersectionRoot = viewChild.required<ElementRef<HTMLDivElement>>('intersectionRoot')

	intersectionTarget = viewChild.required<ElementRef<HTMLDivElement>>('intersectionTarget')

	searchControl = new FormControl<string | undefined>('')

	protected readonly RequestState = RequestState

	constructor(protected readonly wordsService: WordsService) {}

	ngOnInit() {
		this.fetchWords({})
		this.subscribeToSearch()
	}

	ngAfterViewInit() {
		new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (this.pageState() === RequestState.READY && this.wordsService.words.length >= WORDS_PER_INFINITY_LOAD && entry.isIntersecting) {
						const currentSearchQuery = this.searchControl.value || undefined
						if (this.sortState() !== 'none') {
							// When sorting is active, use offset-based pagination
							const currentOffset = this.offset()
							this.fetchWords({ offset: currentOffset, sort: this.getSortParameter(), searchQuery: currentSearchQuery })
						} else {
							// When sorting is inactive, use cursor-based pagination
							this.fetchWords({ lastWordId: this.wordsService.words[this.wordsService.words.length - 1]?.id, searchQuery: currentSearchQuery })
						}
					}
				})
			},
			{
				root: this.intersectionRoot().nativeElement,
				rootMargin: '0px',
				threshold: 0,
			},
		).observe(this.intersectionTarget().nativeElement)
	}

	openAddWordDialog() {
		this.wordsService.openAddWordDialog()
	}

	openEditWordDialog(word: Word) {
		this.wordsService.openEditWordDialog(word)
	}

	toggleSort() {
		const currentState = this.sortState()
		if (currentState === 'none') {
			this.sortState.set('asc')
		} else if (currentState === 'asc') {
			this.sortState.set('desc')
		} else {
			this.sortState.set('none')
		}
		// Reset offset when sort changes
		this.offset.set(0)
		// Fetch words with new sort state, preserving current search query
		const sortParam = this.getSortParameter()
		const currentSearchQuery = this.searchControl.value || undefined
		if (sortParam) {
			this.fetchWords({ sort: sortParam, offset: 0, searchQuery: currentSearchQuery, clearData: true })
		} else {
			this.fetchWords({ searchQuery: currentSearchQuery, clearData: true })
		}
	}

	private getSortParameter(): string | undefined {
		const state = this.sortState()
		if (state === 'none') {
			return undefined
		}
		return `key:${state}`
	}

	private fetchWords({ lastWordId, searchQuery, sort, offset, clearData = false }: FindAllWordsDto & { clearData?: boolean }) {
		this.pageState.set(RequestState.LOADING)

		// Build request object based on whether sorting is active
		const request: FindAllWordsDto = {}
		if (sort) {
			request.sort = sort
			request.offset = offset ?? 0
		} else {
			if (lastWordId !== undefined) {
				request.lastWordId = lastWordId
			}
		}
		if (searchQuery !== undefined) {
			request.searchQuery = searchQuery
		}

		this.wordsService.fetchWords(request).subscribe({
			next: (words) => {
				this.pageState.set(words.length > 0 ? RequestState.READY : RequestState.EMPTY)
				this.wordsService.setWords = clearData ? words : [...this.wordsService.words, ...words]
				// Increment offset after successful fetch when sorting is active and not clearing data
				if (sort && !clearData && words.length > 0) {
					this.offset.set((offset ?? 0) + words.length)
				}
			},
			error: () => this.pageState.set(RequestState.ERROR),
		})
	}

	private subscribeToSearch() {
		this.searchControl.valueChanges.pipe(debounce(() => interval(DEBOUNCE_DELAY))).subscribe({
			next: (searchQuery) => {
				// Reset offset when search changes, but preserve sort state
				this.offset.set(0)
				const sortParam = this.getSortParameter()
				const searchQueryValue = searchQuery || undefined
				if (sortParam) {
					// If sorting is active, use offset-based pagination
					this.fetchWords({ searchQuery: searchQueryValue, sort: sortParam, offset: 0, clearData: true })
				} else {
					// If sorting is inactive, use cursor-based pagination
					this.fetchWords({ searchQuery: searchQueryValue, clearData: true })
				}
			},
		})
	}
}
