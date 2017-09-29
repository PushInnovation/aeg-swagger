import { Request } from 'express';
import Segment from '@adexchange/aeg-xray/lib/segment';

export interface ISwaggerContext {
	request: ISwaggerRequest;
}

export interface ISwaggerOperationValidationResult {
	errors: any[];
}

export interface ISwaggerOperation {
	parameters: ISwaggerOperationParameter[];
	method: string;
	pathObject: {
		path: string
	};
	validateRequest: (req: Request) => ISwaggerOperationValidationResult;
}

export interface ISwaggerRequest extends Request {
	account: any;
	segment?: Segment;
	swagger: {
		params: Array<{
			value: string | number
		}>
		operation: ISwaggerOperation
	};
}

export interface ISwaggerOperationParameter {
	name: string;
	in: string;
	description: string;
	type: string;
	items?: {
		type: string
	};
}

export interface ISwaggerValidationErrors {
	parameter: string;
	errors: Array<{
		message: string;
		code: string;
	}>;
}
