import { Component, OnInit, signal } from '@angular/core'
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

@Component({
	selector: 'app-create-multiplayer-game',
	imports: [FaIconComponent, MatTooltip, TextFieldComponent, ReactiveFormsModule, ButtonComponent, KeyValuePipe],
	templateUrl: './create-multiplayer-game.component.html',
	styleUrl: './create-multiplayer-game.component.scss',
})
export class CreateMultiplayerGameComponent implements OnInit {
	createMultiplayerGameFormGroup = new FormGroup({
		name: new FormControl<string>('', { validators: [Validators.required] }),
		emails: new FormArray([new FormControl<string>('')], { validators: [Validators.required, Validators.email] }),
		invitationText: new FormControl(
			"Hey everyone, feeling the itch to play some Lynx together?! I'm inviting you to this game room to play. Anyone up for some laughs (and maybe some friendly competition)?  Let me know if you're in!",
			{ validators: [Validators.required] },
		),
		gameDateAndTime: new FormControl<string>('', { validators: [Validators.required] }),
		timezone: new FormControl<string>('America/Denver', { validators: [Validators.required] }),
	})

	timezoneMap = TIMEZONES

	isCreatingGame = signal<boolean>(false)

	icons = { faTimesCircle }

	protected readonly MAXIMUM_NUMBER_OF_INVITE_EMAILS = MAXIMUM_NUMBER_OF_INVITE_EMAILS

	constructor(private readonly router: Router) {}

	get formControls() {
		return this.createMultiplayerGameFormGroup.controls
	}

	get emailsFormArray() {
		return this.createMultiplayerGameFormGroup.controls.emails as FormArray<FormControl<string | null>>
	}

	ngOnInit() {
		this.createMultiplayerGameFormGroup.patchValue({
			gameDateAndTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
		})
	}

	async exit() {
		await this.router.navigateByUrl('/')
	}

	createMultiplayerGameFormSubmit() {
		console.log(format(this.createMultiplayerGameFormGroup.value.gameDateAndTime!, "yyyy-MM-dd'T'HH:mm"))
		// console.log(parseISO(this.createMultiplayerGameFormGroup.value.gameDateAndTime!, { in: tz(this.createMultiplayerGameFormGroup.value.timezone!) }))
		// console.log({ formData: this.createMultiplayerGameFormGroup.value, valid: this.createMultiplayerGameFormGroup.valid })
	}

	addNewEmailField() {
		this.emailsFormArray.push(new FormControl<string>(''))
	}

	removeEmailField(index: number) {
		this.emailsFormArray.removeAt(index)
	}
}
