import ApiCache from '../api-cache';
import { EventEmitter } from 'events';
import * as BBPromise from 'bluebird';
import { ISwaggerContext } from '../types/types';

/**
 * Swagger bagpipes fitting to cache api method responses
 */
export default class AegCache extends EventEmitter {

	private _cachePrefix: string;

	/**
	 * Constructor
	 */
	constructor (cachePrefix: string) {

		super();

		this._cachePrefix = cachePrefix;

	}

	/**
	 * Get the fitting
	 */
	public fitting (config: any): (context: ISwaggerContext, callback: (err?: Error) => void) => void {

		const self = this;

		return (context, callback) => {

			const operation = context.request.swagger.operation;

			if (!operation['x-cache']) {

				return callback();

			}

			this._fittingInternal(config, context)
				.then(() => {

					callback();

				})
				.catch((ex) => {

					self.emit('error', {message: 'could not cache', err: ex});

					callback();

				});

		};

	}

	/**
	 * get the fitting promise
	 */
	private async _fittingInternal (config: any, context): Promise<void> {

		const self = this;
		const operation = context.request.swagger.operation;

		const cacheOptions: any = {
			host: config.host,
			port: config.port
		};

		if (this._cachePrefix) {

			cacheOptions.prefix = this._cachePrefix;

		}

		const client = new ApiCache(cacheOptions).on('error', (obj) => {

			self.emit('error', obj);

		});

		self.emit('debug', {
			message: 'cache hit',
			data: {
				operation: operation.operationId,
				description: operation.description
			}
		});

		const options = {
			expire: operation['x-cache']
		};

		const route: any = BBPromise.promisify(client.route(options), {context: client});

		await route(context.request, context.response);

	}

}
