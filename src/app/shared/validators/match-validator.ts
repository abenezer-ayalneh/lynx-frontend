import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

export class MatchValidator {
	static match(controlName: string, matchingControlName: string): ValidatorFn {
		return (formGroup: AbstractControl): ValidationErrors | null => {
			const control = formGroup.get(controlName)
			const matchingControl = formGroup.get(matchingControlName)

			if (!control || !matchingControl) {
				console.error('Form controls can not be found in the form group!')
				return { controlNotFound: true }
			}

			const error = control.value !== matchingControl.value ? { noMatch: true } : null

			matchingControl.setErrors(error)
			return error
		}
	}
}
