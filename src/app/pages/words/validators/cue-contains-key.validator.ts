import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms'

/**
 * Validator function that checks if the `key` string is found in the rest of the controllers' values.
 *
 * @return {ValidatorFn} A function that takes an AbstractControl and returns a ValidationErrors object
 * if the key is not found in the rest of the controllers' values, or null if it does.
 */
export function cueContainsKeyValidator(): ValidatorFn {
	return (abstractControl: AbstractControl): ValidationErrors | null => {
		const formGroup = abstractControl as FormGroup<{
			key: FormControl<string>
			cue1: FormControl<string>
			cue2: FormControl<string>
			cue3: FormControl<string>
			cue4: FormControl<string>
			cue5: FormControl<string>
			status: FormControl<boolean>
		}>

		if (
			!formGroup.controls.cue1.value.toLowerCase().includes(formGroup.controls.key.value.toLowerCase()) ||
			!formGroup.controls.cue2.value.toLowerCase().includes(formGroup.controls.key.value.toLowerCase()) ||
			!formGroup.controls.cue3.value.toLowerCase().includes(formGroup.controls.key.value.toLowerCase()) ||
			!formGroup.controls.cue4.value.toLowerCase().includes(formGroup.controls.key.value.toLowerCase()) ||
			!formGroup.controls.cue5.value.toLowerCase().includes(formGroup.controls.key.value.toLowerCase())
		) {
			return { cueContainsKey: true }
		}

		return null
	}
}
