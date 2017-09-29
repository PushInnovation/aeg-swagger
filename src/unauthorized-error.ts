/**
 * Extends error to be an unauthorized API error
 */
export default class UnauthorizedError extends Error {

	public statusCode: number;

	constructor (message?: string) {

		super(message || 'You are not authorized to access this resource');

		// Remove this when we target es2015+
		Object.setPrototypeOf(this, UnauthorizedError.prototype);

		this.statusCode = 401;

	}

}
