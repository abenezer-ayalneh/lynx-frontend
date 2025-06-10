import { JsonPipe } from '@angular/common'
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
	imports: [MatIcon, HighlightKeyPipe, MatIconButton, MatTooltip, ButtonComponent, TextFieldComponent, MatProgressBar, JsonPipe],
	templateUrl: './words.component.html',
	styleUrl: './words.component.scss',
})
export class WordsComponent implements OnInit, AfterViewInit {
	pageState = signal<RequestState>(RequestState.LOADING)

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
						this.fetchWords({ lastWordId: this.wordsService.words[this.wordsService.words.length - 1]?.id })
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

	private fetchWords({ lastWordId, searchQuery, sort, clearData = false }: FindAllWordsDto & { clearData?: boolean }) {
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
					this.fetchWords({ searchQuery, clearData: true })
				} else {
					this.fetchWords({ clearData: true })
				}
			},
		})
	}
}
