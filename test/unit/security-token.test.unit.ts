import * as should from 'should';
import SecurityToken from '../../src/security-token';

describe('SecurityToken', async () => {

	it('should not be valid', async () => {

		const test = new SecurityToken('test');
		return should(test.parse('test')).be.rejected();

	});

});
