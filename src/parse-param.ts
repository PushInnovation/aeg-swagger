/**
 * Parses swagger parameters by returning its value or null
 */
import { ISwaggerRequest } from './types/types';

export default <T> (req: ISwaggerRequest, param: string): T => {

	return req.swagger.params[param] ? req.swagger.params[param].value : null;

};
