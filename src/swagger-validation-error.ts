/**
 * Extends an Error to be an unauthorized API error
 */
import { ISwaggerValidationErrors } from './types/types';

export default class SwaggerValidationError extends Error {

	public statusCode: number;

	public errors?: ISwaggerValidationErrors[];

	constructor () {

		super('Validation errors');

		// Remove this when we target es2015+
		Object.setPrototypeOf(this, SwaggerValidationError.prototype);

		this.statusCode = 400;

	}

}
