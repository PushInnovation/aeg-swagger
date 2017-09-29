import * as redis from 'redis';
import * as BBPromise from 'bluebird';
import { EventEmitter } from 'events';
import { ISwaggerRequest } from './types/types';
import { Response } from 'express';

export interface IApiCacheOptions {
	host: string;
	port: number;
	prefix: string;
}

class ApiCache extends EventEmitter {

	private _options: IApiCacheOptions;

	private _client: any;

	/**
	 * Constructor
	 */
	constructor (options: IApiCacheOptions) {

		super();

		this._options = options;
		this._client = redis.createClient(this._options);
		BBPromise.promisifyAll(this._client);

	}

	/**
	 * Route from cache, or cache the route
	 */
	public route (options) {

		return (req, res, next) => {

			this._routeInternal(req, res, options)
				.then((cache) => {

					// do not call next on a cache hit
					if (!cache) {

						next();

					}

				})
				.catch(() => {

					next();

				});

		};

	}

	/**
	 * Get the route promise
	 */
	private async _routeInternal (req: ISwaggerRequest, res: Response, options: { expire?: number } = {}): Promise<void> {

		const self = this;
		const cache = await this._get(req.originalUrl);

		if (cache) {

			res.contentType('application/json');
			res.json(cache);
			return cache;

		} else {

			const preCacheSend = res.send.bind(res);

			res.send = (body) => {

				const ret = preCacheSend(body);

				self._set(req.originalUrl, body, (options && options.expire) ? options.expire : -1)
					.then(() => {

						return ret;

					})
					.catch((ex) => {

						self.emit('error', {message: 'failed to cache response', err: ex});

						return ret;

					});

				return res;

			};

		}

	}

	/**
	 * Get the route cache
	 */
	private async _get (name): Promise<any> {

		const result = await this._client.getAsync(name);
		return JSON.parse(result);

	}

	/**
	 * Cache the route
	 */
	private async _set (name: string, data: any, expire: number): Promise<void> {

		await this._client.setAsync(name, data);
		await this._client.expireAsync(name, expire);

	}

}

export default ApiCache;
