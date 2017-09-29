/**
 * Extends an Error to be an unauthorized API error
 */
export default class PermissionDeniedError extends Error {

	public statusCode: number;

	constructor (message?: string) {

		super(message || 'Permission denied');

		// Remove this when we target es2015+
		Object.setPrototypeOf(this, PermissionDeniedError.prototype);

		this.statusCode = 403;

	}

}
