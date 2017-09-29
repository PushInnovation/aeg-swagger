import { ISwaggerValidationErrors } from './types/types';

/**
 * Extends Error to include a set of validation errors
 */
export default class ValidationError extends Error {

	public validationErrors: ISwaggerValidationErrors[];

	constructor (validationErrors: ISwaggerValidationErrors[]) {

		super('There are validation errors');

		// Remove this when we target es2015+
		Object.setPrototypeOf(this, ValidationError.prototype);

		this.validationErrors = validationErrors;

	}

}
