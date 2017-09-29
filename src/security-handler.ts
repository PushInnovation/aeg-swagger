import { Token } from '@push_innovation/aeg-security';
import { EventEmitter } from 'events';
import SecurityToken from './security-token';

/**
 * Authorizes an access token
 */
class SecurityHandler extends EventEmitter {

	private _secret: string;

	/**
	 * Constructor
	 */
	constructor (secret: string) {

		super();

		this._secret = secret;

	}

	/**
	 * Handler
	 */
	public handler () {

		return (req, def, routeScopes, callback) => {

			this._handlerInternal(req, routeScopes)
				.then(() => {

					callback();

				})
				.catch((ex) => {

					callback(ex);

				});

		};

	}

	/**
	 * Gets the handler promise
	 */
	private async _handlerInternal (req, routeScopes) {

		this.emit('debug', {message: req.url});

		const securityToken = new SecurityToken(Token.parseTokenFromAuthorization(req.headers.authorization));
		return securityToken.parse(this._secret, {scopes: routeScopes});

	}

}

export default SecurityHandler;
