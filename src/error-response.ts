import * as _ from 'lodash';
import { Response } from 'express';

/**
 * Handles an error response
 */
export default function errorResponse (err: any, res: Response, optionalResponseData?: any) {

	const data = {
		message: err.userMessage || err.message || (err.statusCode === 401 ? 'Unauthorized' : 'Bad Request')
	};

	if (optionalResponseData) {

		_.extend(data, optionalResponseData);

	}

	res.status(err.statusCode || 400).json(data);

}
