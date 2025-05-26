import { Component, Inject, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCheckbox } from '@angular/material/checkbox'
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog'
import { finalize } from 'rxjs'

import { ButtonComponent } from '../../../../shared/components/button/button.component'
import { TextFieldComponent } from '../../../../shared/components/text-field/text-field.component'
import { RequestState } from '../../../../shared/types/page-state.type'
import CreateWordDto from '../../dto/create-word.dto'
import { Word } from '../../types/words.type'
import { cueContainsKeyValidator } from '../../validators/cue-contains-key.validator'
import { WordsService } from '../../words.service'

@Component({
	selector: 'app-word-dialog',
	imports: [MatDialogTitle, MatDialogContent, TextFieldComponent, ButtonComponent, MatCheckbox, ReactiveFormsModule],
	templateUrl: './word-dialog.component.html',
	styleUrl: './word-dialog.component.scss',
})
export class WordDialogComponent implements OnInit {
	saveButtonStatus = signal<RequestState>(RequestState.IDLE)

	deleteButtonStatus = signal<RequestState>(RequestState.IDLE)

	wordDialogFormGroup = new FormGroup({
		key: new FormControl<string>('', { validators: [Validators.required] }),
		cue1: new FormControl<string>('', { validators: [Validators.required, cueContainsKeyValidator('key')] }),
		cue2: new FormControl<string>('', { validators: [Validators.required, cueContainsKeyValidator('key')] }),
		cue3: new FormControl<string>('', { validators: [Validators.required, cueContainsKeyValidator('key')] }),
		cue4: new FormControl<string>('', { validators: [Validators.required, cueContainsKeyValidator('key')] }),
		cue5: new FormControl<string>('', { validators: [Validators.required, cueContainsKeyValidator('key')] }),
		status: new FormControl<boolean>(true, { validators: [Validators.required] }),
	})

	protected readonly RequestState = RequestState

	constructor(
		private readonly wordsService: WordsService,
		@Inject(MAT_DIALOG_DATA) protected readonly data: { type: 'UPDATE' | 'ADD'; word?: Word },
	) {}

	get formControls() {
		return this.wordDialogFormGroup.controls
	}

	ngOnInit() {
		if (this.data.type === 'UPDATE' && this.data.word) {
			this.wordDialogFormGroup.patchValue({
				key: this.data.word.key,
				cue1: this.data.word.cue_word_1,
				cue2: this.data.word.cue_word_2,
				cue3: this.data.word.cue_word_3,
				cue4: this.data.word.cue_word_4,
				cue5: this.data.word.cue_word_5,
				status: this.data.word.status,
			})
		}
	}

	wordDialogFormSubmit() {
		this.saveButtonStatus.set(RequestState.LOADING)
		const word: CreateWordDto = {
			key: this.formControls.key.value!,
			cue_word_1: this.formControls.cue1.value!,
			cue_word_2: this.formControls.cue2.value!,
			cue_word_3: this.formControls.cue3.value!,
			cue_word_4: this.formControls.cue4.value!,
			cue_word_5: this.formControls.cue5.value!,
			status: this.formControls.status.value!,
		}

		if (this.data.type === 'ADD') {
			this.wordsService
				.createWord(word)
				.pipe(finalize(() => this.saveButtonStatus.set(RequestState.IDLE)))
				.subscribe({
					next: (createdWord) => {
						this.wordsService.setWords = [...this.wordsService.words, createdWord]
						this.wordsService.closeModals()
					},
					error: () => {
						console.log('Error creating word')
					},
				})
		}

		if (this.data.type === 'UPDATE' && this.data.word) {
			this.wordsService
				.updateWord(this.data.word.id, word)
				.pipe(finalize(() => this.saveButtonStatus.set(RequestState.IDLE)))
				.subscribe({
					next: (updatedWord) => {
						this.wordsService.setWords = this.wordsService.words.map((word) => (word.id === updatedWord.id ? updatedWord : word))
						this.wordsService.closeModals()
					},
					error: () => {
						console.log('Error updating word')
					},
				})
		}
	}

	deleteWord() {
		if (this.data.word) {
			this.deleteButtonStatus.set(RequestState.LOADING)
			this.wordsService
				.deleteWord(this.data.word.id)
				.pipe(finalize(() => this.saveButtonStatus.set(RequestState.IDLE)))
				.subscribe({
					next: (deletedWord) => {
						this.wordsService.setWords = this.wordsService.words.filter((word) => word.id !== deletedWord.id)
						this.wordsService.closeModals()
					},
					error: () => {
						console.log('Error deleting word')
					},
				})
		}
	}
}
