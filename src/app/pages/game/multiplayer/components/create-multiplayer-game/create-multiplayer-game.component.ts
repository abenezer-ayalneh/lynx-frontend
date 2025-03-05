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
import { combineLatest, finalize } from 'rxjs'
import { TZDateMini } from '@date-fns/tz'
import { MultiplayerService } from '../../multiplayer.service'
import { ScheduledGameType } from '../../dto/create-multiplayer-room.dto'

@Component({
	selector: 'app-create-multiplayer-game',
	imports: [FaIconComponent, MatTooltip, TextFieldComponent, ReactiveFormsModule, ButtonComponent, KeyValuePipe],
	templateUrl: './create-multiplayer-game.component.html',
	styleUrl: './create-multiplayer-game.component.scss',
})
export class CreateMultiplayerGameComponent implements OnInit {
	createMultiplayerGameFormGroup = new FormGroup({
		emails: new FormArray([new FormControl<string>('', { validators: [Validators.required, Validators.email] })]),
		invitationText: new FormControl("Hey everyone, feeling the itch to play some Lynx together?! I'm inviting you to this game room to play. Let me know if you're in!", {
			validators: [Validators.required],
		}),
		gameScheduleType: new FormControl<ScheduledGameType>(ScheduledGameType.INSTANT, { validators: [Validators.required] }),
		gameDateAndTime: new FormControl<string>({ value: '', disabled: true }, { validators: [Validators.required] }),
		timezone: new FormControl<string>({ value: '', disabled: true }, { validators: [Validators.required] }),
	})

	isCreatingGame = signal<boolean>(false)

	localDateAndTime = signal<string | null>(null)

	icons = { faTimesCircle }

	@ViewChild('gameCreatedModal') gameCreatedModal!: ElementRef

	protected readonly TIMEZONES = TIMEZONES

	protected readonly MAXIMUM_NUMBER_OF_INVITE_EMAILS = MAXIMUM_NUMBER_OF_INVITE_EMAILS

	protected readonly ScheduledGameType = ScheduledGameType

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
		this.updateLocalTimeData()
		this.subscribeToGameScheduleType()
	}

	updateLocalTimeData() {
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

	subscribeToGameScheduleType() {
		this.formControls.gameScheduleType.valueChanges.subscribe({
			next: (value) => {
				if (value === ScheduledGameType.INSTANT) {
					this.formControls.gameDateAndTime.disable()
					this.formControls.timezone.disable()
				} else if (value === ScheduledGameType.FUTURE) {
					this.formControls.gameDateAndTime.enable()
					this.formControls.timezone.enable()
				}
			},
		})
	}

	async exit() {
		await this.router.navigateByUrl('home')
	}

	createMultiplayerGameFormSubmit() {
		if (this.createMultiplayerGameFormGroup.valid) {
			const gameType = this.createMultiplayerGameFormGroup.value.gameScheduleType!
			this.isCreatingGame.set(true)
			this.multiplayerService
				.createScheduledGame({
					emails: this.createMultiplayerGameFormGroup.value.emails as string[],
					invitation_text: this.createMultiplayerGameFormGroup.value.invitationText!,
					gameScheduleType: gameType,
					start_time: this.createMultiplayerGameFormGroup.value.gameDateAndTime ?? undefined,
					timezone: this.createMultiplayerGameFormGroup.value.timezone ?? undefined,
				})
				.pipe(finalize(() => this.isCreatingGame.set(false)))
				.subscribe({
					next: (response) => {
						if (gameType === ScheduledGameType.INSTANT) {
							this.router.navigateByUrl(`/scheduled-game/lobby?id=${response.lobbyId}`)
						} else {
							this.gameCreatedModal.nativeElement.showModal()
						}
					},
				})
		}
	}

	addNewEmailField() {
		this.emailsFormArray.push(new FormControl<string>('', { validators: [Validators.required, Validators.email] }))
	}

	removeEmailField(index: number) {
		this.emailsFormArray.removeAt(index)
	}
}
