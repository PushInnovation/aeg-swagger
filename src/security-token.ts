import PermissionDeniedError from './permission-denied-error';
import UnauthorizedError from './unauthorized-error';
import { Token, ITokenOrganization } from '@push_innovation/aeg-security';
import * as njwt from 'njwt';
import * as _ from 'lodash';
import * as BBPromise from 'bluebird';

const invalidToken = 'Invalid token';
const expiredToken = 'Expired token';
const wrongEnvToken = 'Token environment mismatch';

/**
 * Security token parser
 */
export default class SecurityToken {

	private _account: string | null;

	private _accessToken: string | null;

	private _scopes: string[] | null;

	private _env: string | null;

	private _organization: ITokenOrganization | null;

	/**
	 * Constructor
	 */
	constructor (accessToken) {

		this._account = null;
		this._accessToken = accessToken;
		this._scopes = null;
		this._env = null;
		this._organization = null;

	}

	/**
	 * Get the organization
	 */
	public get organization (): ITokenOrganization | null {

		return this._organization;

	}

	/**
	 * Basic token validation for expiration and environment
	 */
	public async parse (secret: string, options: { scopes?: string[] } = {}): Promise<void> {

		const self = this;

		const verify: any = BBPromise.promisify(njwt.verify, {context: njwt});

		try {

			const expandedJwt = await verify(this._accessToken, secret);

			self._account = Token.parseAccountFromJwt(expandedJwt);
			self._scopes = Token.parseScopesFromJwt(expandedJwt);
			self._env = Token.parseEnvFromJwt(expandedJwt);
			self._organization = Token.parseOrganizationFromJwt(expandedJwt);

			if (self._env !== process.env.NODE_ENV) {

				throw new UnauthorizedError(wrongEnvToken);

			}

			if (options.scopes && options.scopes.length) {

				if (!self.scopesAuthorized(options.scopes)) {

					throw new PermissionDeniedError();

				}

			}

		} catch (ex) {

			if (ex instanceof UnauthorizedError || ex instanceof PermissionDeniedError) {

				throw ex;

			}

			if (ex.message === 'Jwt is expired') {

				throw new UnauthorizedError(expiredToken);

			} else {

				throw new UnauthorizedError(invalidToken);

			}

		}

	}

	/**
	 * Get the account
	 */
	public get account (): string | null {

		return this._account;

	}

	/**
	 * Are the scopes authorized
	 */
	public scopesAuthorized (scopes: string[]): boolean {

		return _.intersection(scopes, this._scopes).length > 0;

	}

	/**
	 * Does the organization match
	 */
	public matchesOrganization (organization): boolean {

		if (!this._organization) {

			return false;

		}

		return this._organization && this._organization.nameKey === organization;

	}

}
