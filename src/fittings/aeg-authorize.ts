import parseParam from '../parse-param';
import PermissionDeniedError from '../permission-denied-error';
import UnauthorizedError from '../unauthorized-error';
import { Token } from '@push_innovation/aeg-security';
import { EventEmitter } from 'events';
import SecurityToken from '../security-token';
import { ISwaggerContext } from '../types/types';

/**
 * Swagger bagpipes fitting to perform granular authorizations
 */
export default class AegAuthorize extends EventEmitter {

	private _secret: string;

	/**
	 * Set the JWT secret
	 */
	set secret (secret: string) {

		this._secret = secret;

	}

	/**
	 * Get the fitting
	 */
	public fitting (): (context: ISwaggerContext, callback: (err?: Error) => void) => void {

		const self = this;

		return (context, callback) => {

			const operation = context.request.swagger.operation;

			if (!operation['x-aeg-authorize']) {

				return callback();

			}

			this._fittingInternal(context)
				.then(() => {

					callback();

				})
				.catch((ex) => {

					if (!(ex instanceof PermissionDeniedError || ex instanceof UnauthorizedError)) {

						self.emit('error', {message: 'could not authorize', err: ex});

					}

					callback(ex);

				});

		};

	}

	/**
	 * get the fitting promise
	 */
	private async _fittingInternal (context: ISwaggerContext): Promise<void> {

		const self = this;

		const operation = context.request.swagger.operation;
		const authorize = operation['x-aeg-authorize'];
		const authorizationScoped = !!authorize.scopes;
		const authorizationScopes = ['platform:admin'];

		if (authorizationScoped) {

			authorizationScopes.push(...authorize.scopes);

		}

		self.emit('debug', {
			message: 'authorize',
			data: {type: authorize.type, parameter: authorize.parameter, scopes: authorizationScopes}
		});

		const securityToken = new SecurityToken(Token.parseTokenFromAuthorization(context.request.headers.authorization));

		switch (authorize.type) {
			case 'token':

				self.emit('debug', {message: 'token'});

				await securityToken.parse(this._secret);

				if (authorizationScoped) {

					if (!securityToken.scopesAuthorized(authorizationScopes)) {

						throw new PermissionDeniedError();

					}

				}

				break;
			case 'platform-admin':

				self.emit('debug', {message: 'platform-admin'});

				await securityToken.parse(this._secret);

				if (!securityToken.scopesAuthorized(['platform:admin'])) {

					throw new PermissionDeniedError();

				}

				break;
			case 'owner':

				self.emit('debug', {message: 'owner'});

				await securityToken.parse(this._secret);

				if (securityToken.scopesAuthorized(authorizationScopes)) {

					return;

				}

				let resourceId = parseParam(context.request, authorize.parameter);

				// resource level authorization is still required at the endpoint!
				if (!resourceId) {

					resourceId = context.request.account.id;

				}

				if (resourceId !== context.request.account.id) {

					throw new PermissionDeniedError();

				}

				break;
			case 'affiliate':

				const affiliateId = parseParam(context.request, authorize.parameter);

				self.emit('debug', {message: 'affiliate', data: {affiliateId}});

				await securityToken.parse(this._secret);

				if (securityToken.scopesAuthorized(authorizationScopes)) {

					return;

				}

				if (securityToken.organization) {

					self.emit('debug', {
						message: 'adminOrAffiliate',
						data: {organization: securityToken.organization}
					});

					if (!securityToken.matchesOrganization(affiliateId)) {

						throw new PermissionDeniedError();

					}

				} else {

					throw new PermissionDeniedError();

				}

				break;
			default:
				self.emit('debug', {message: 'type not found'});
				throw new PermissionDeniedError();
		}

	}

}
