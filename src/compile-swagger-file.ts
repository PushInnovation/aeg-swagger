import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import * as config from 'config';

/**
 * Compiles a swagger.yaml file from a mustache template
 */
export default (swaggerPath: string) => {

	let defaultResponseCodes = [];
	let protocols = ['http', 'https'];

	if (config.has('app')) {

		const appConfig: any = config.get('aeg-swagger');

		if (appConfig.protocols) {

			protocols = appConfig.protocols;

		}

		if (appConfig.responseCodes && appConfig.responseCodes.default) {

			defaultResponseCodes = appConfig.responseCodes.default;

		}

	}

	const template = fs.readFileSync(path.join(swaggerPath, 'swagger.mustache.yaml'), {encoding: 'utf8'});

	Mustache.parse(template);

	const rendered = Mustache.render(template, {
		protocols,
		defaultResponseCodes
	});

	fs.writeFileSync(path.join(swaggerPath, 'swagger.yaml'), rendered);

};
