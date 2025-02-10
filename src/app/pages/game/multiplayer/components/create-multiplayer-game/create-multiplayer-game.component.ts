import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { MatTooltip } from '@angular/material/tooltip'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { Router } from '@angular/router'
import { TextFieldComponent } from '../../../../../shared/components/text-field/text-field.component'
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonComponent } from '../../../../../shared/components/button/button.component'
import { format } from 'date-fns'
import { MAXIMUM_NUMBER_OF_INVITE_EMAILS } from '../../../../../shared/constants/common.constants'
import { KeyValuePipe } from '@angular/common'
import { TIMEZONES } from '../../../../../shared/constants/timezones.constants'
import { MultiplayerService } from '../../multiplayer.service'
import { combineLatest, finalize } from 'rxjs'
import { TZDateMini } from '@date-fns/tz'

@Component({
	selector: 'app-create-multiplayer-game',
	imports: [FaIconComponent, MatTooltip, TextFieldComponent, ReactiveFormsModule, ButtonComponent, KeyValuePipe],
	templateUrl: './create-multiplayer-game.component.html',
	styleUrl: './create-multiplayer-game.component.scss',
})
export class CreateMultiplayerGameComponent implements OnInit {
	createMultiplayerGameFormGroup = new FormGroup({
		// name: new FormControl<string>('', { validators: [Validators.required] }),
		emails: new FormArray([new FormControl<string>('')], { validators: [Validators.required, Validators.email] }),
		invitationText: new FormControl(
			"Hey everyone, feeling the itch to play some Lynx together?! I'm inviting you to this game room to play. Anyone up for some laughs (and maybe some friendly competition)?  Let me know if you're in!",
			{ validators: [Validators.required] },
		),
		gameDateAndTime: new FormControl<string>('', { validators: [Validators.required] }),
		timezone: new FormControl<string>('', { validators: [Validators.required] }),
	})

	timezoneMap = TIMEZONES

	isCreatingGame = signal<boolean>(false)

	localDateAndTime = signal<string | null>(null)

	icons = { faTimesCircle }

	@ViewChild('gameCreatedModal') gameCreatedModal!: ElementRef

	protected readonly MAXIMUM_NUMBER_OF_INVITE_EMAILS = MAXIMUM_NUMBER_OF_INVITE_EMAILS

	constructor(
		private readonly router: Router,
		private readonly multiplayerService: MultiplayerService,
	) {}

	get formControls() {
		return this.createMultiplayerGameFormGroup.controls
	}

	get emailsFormArray() {
		return this.createMultiplayerGameFormGroup.controls.emails as FormArray<FormControl<string | null>>
	}

	ngOnInit() {
		combineLatest([this.formControls.gameDateAndTime.valueChanges, this.formControls.timezone.valueChanges]).subscribe({
			next: ([gameDateAndTime, timezone]) => {
				if (gameDateAndTime && timezone) {
					this.localDateAndTime.set(format(new TZDateMini(gameDateAndTime, timezone), 'MMM dd, yyyy hh:mm aaa'))
				} else {
					this.localDateAndTime.set(null)
				}
			},
		})
	}

	async exit() {
		await this.router.navigateByUrl('/')
	}

	createMultiplayerGameFormSubmit() {
		if (this.createMultiplayerGameFormGroup.valid) {
			this.isCreatingGame.set(true)
			this.multiplayerService
				.createScheduledGame({
					emails: this.createMultiplayerGameFormGroup.value.emails as string[],
					invitation_text: this.createMultiplayerGameFormGroup.value.invitationText!,
					start_time: this.createMultiplayerGameFormGroup.value.gameDateAndTime!,
					timezone: this.createMultiplayerGameFormGroup.value.timezone!,
				})
				.pipe(finalize(() => this.isCreatingGame.set(false)))
				.subscribe({
					complete: () => {
						this.gameCreatedModal.nativeElement.showModal()
					},
				})
		}
	}

	addNewEmailField() {
		this.emailsFormArray.push(new FormControl<string>(''))
	}

	removeEmailField(index: number) {
		this.emailsFormArray.removeAt(index)
	}
}
