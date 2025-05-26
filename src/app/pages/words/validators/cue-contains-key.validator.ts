import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms'

/**
 * Validator function that checks if the `key` string is found in the rest of the controllers' values.
 *
 * @return {ValidatorFn} A function that takes an AbstractControl and returns a ValidationErrors object
 * if the key is not found in the rest of the controllers' values, or null if it does.
 */
export function cueContainsKeyValidator(keyControlName: string): ValidatorFn {
	return (abstractControl: AbstractControl): ValidationErrors | null => {
		const formControl = abstractControl as FormControl
		const formGroup = formControl.parent as FormGroup

		if (formGroup && formControl) {
			const keyFormControl = formGroup.controls[keyControlName] as FormControl
			if (keyFormControl && keyFormControl.valid && formControl.value && !(formControl.value as string).includes(keyFormControl.value)) {
				return { cueContainsKey: true }
			}
		}

		return null
	}
}
