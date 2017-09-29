import * as _ from 'lodash';
import { Response } from 'express';
import { ISwaggerRequest } from './types/types';
import ValidationError from './validation-error';

/**
 * Produces a consistent validation error response with the swagger tools
 */
export default (req: ISwaggerRequest, res: Response, validationErrors: ValidationError): void => {

	const operation = req.swagger.operation;

	const response = {
		message: 'Validation errors',
		errors: _.map(validationErrors.validationErrors, (validationError) => {

			const error: any = {};

			const indexOfParam = _.findIndex(operation.parameters, (parameter) => {

				return parameter.name === validationError.parameter;

			});

			const param = _.find(operation.parameters, (parameter) => {

				return parameter.name === validationError.parameter;

			});

			error.code = 'INVALID_REQUEST_PARAMETER';

			error.errors = _.map(validationError.errors, (innerError) => {

				return {
					code: innerError.code,
					message: innerError.message,
					path: [],
					description: param ? param.description : ''
				};

			});

			error.in = param ? param.in : '';
			error.message = `Invalid parameter (${param ? param.name : ''}): Value failed JSON Schema validation`;
			error.name = param ? param.name : '';
			error.path = [
				'paths',
				operation.pathObject.path,
				operation.method,
				'parameters',
				String(indexOfParam)
			];

			return error;

		})
	};

	res.status(400).json(response);

};
