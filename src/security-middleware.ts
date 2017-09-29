import { Token } from '@adexchange/aeg-security';
import { EventEmitter } from 'events';
import SecurityToken from './security-token';

/**
 *  Middleware to populate the account details to the request
 */
export default class SecurityMiddleware extends EventEmitter {

	private _secret: string;

	/**
	 * Constructor
	 */
	constructor (secret: string) {

		super();

		this._secret = secret;

	}

	/**
	 * Get the middleware
	 */
	public async middleware () {

		const self = this;

		return (req, res, next) => {

			this._middlewareInternal(req)
				.then(() => {

					next();

				})
				.catch((ex) => {

					self.emit('error', {message: 'could not parse security token', err: ex});

					next();

				});

		};

	}

	/**
	 * Gets the middleware promise
	 */
	private async _middlewareInternal (req) {

		if (req.headers.authorization && req.headers.authorization.match(/^bearer.*/i)) {

			const accessToken = Token.parseTokenFromAuthorization(req.headers.authorization);

			req.account = {};

			const securityToken = new SecurityToken(accessToken);

			await securityToken.parse(this._secret);

			req.account.id = securityToken.account;

		}

	}

}
