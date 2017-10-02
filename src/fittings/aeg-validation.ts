import { EventEmitter } from 'events';
<<<<<<< HEAD
import { securityApi } from '@push_innovation/aeg-sdk';
import { Token } from '@push_innovation/aeg-security';
=======
>>>>>>> dev-aeg
import { ISwaggerContext } from '../types/types';
import SwaggerValidationError from '../swagger-validation-error';

/**
 * Swagger bagpipes fitting to validate a request body with the swagger def
 * Optionally will write validation errors to XRay
 */
export default class AegValidation extends EventEmitter {

	/**
	 * Get the fitting
	 */
	public fitting (): (context: ISwaggerContext, callback: (err?: Error) => void) => void {

		const self = this;

		return (context, callback) => {

			this._fittingInternal(context)
				.then(() => {

					callback();

				})
				.catch((ex) => {

					self.emit('error', {message: 'swagger validation errors', err: ex});

					callback(ex);

				});

		};

	}

	/**
	 * get the fitting promise
	 */
	private async _fittingInternal (context: ISwaggerContext): Promise<void> {

		const validateResult = context.request.swagger.operation.validateRequest(context.request);
		if (validateResult.errors.length > 0) {

			const error = new SwaggerValidationError();

			error.statusCode = 400;
			error.errors = validateResult.errors;

			if (context.request.segment) {

				context.request.segment.addMetadata('validationErrors', error.errors);
				context.request.segment.addMetadata('requestBody', context.request.body);

			}

			throw error;

		}

	}

}
