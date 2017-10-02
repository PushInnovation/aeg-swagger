import { EventEmitter } from 'events';
import { SecurityService } from '@push_innovation/aeg-sdk';
import * as _ from 'lodash';
import { Token } from '@push_innovation/aeg-security';
import { ISwaggerContext } from '../types/types';

/**
 * Swagger bagpipes fitting to populate the request's full account
 */
export default class AegAccount extends EventEmitter {

	/**
	 * Get the fitting
	 */
	public fitting (): (context: ISwaggerContext, callback: (err?: Error) => void) => void {

		const self = this;

		return (context, callback) => {

			const operation = context.request.swagger.operation;

			if (!operation['x-aeg-account']) {

				return callback();

			}

			this._fittingInternal(context)
				.then(() => {

					callback();

				})
				.catch((ex) => {

					self.emit('error', {message: 'could not get account for authorization', err: ex});

					callback();

				});

		};

	}

	/**
	 * get the fitting promise
	 */
	private async _fittingInternal (context: ISwaggerContext): Promise<void> {

		const self = this;

		const req = context.request;

		if (req.headers.authorization) {

			const securityService = new SecurityService();
			const accessToken = Token.parseTokenFromAuthorization(req.headers.authorization);
			securityService.setToken(accessToken);
			const result = await securityService.getAccount();

			if (!req.account) {

				req.account = {};

			}

			_.merge(req.account, result.body.account);

			// until we can fix the clients
			req.account.id = req.account.href;

			self.emit('debug', {
				message: 'account lookup',
				data: {
					account: req.account
				}
			});

		}

	}

}
