import { MachineUnhandledError } from './machine-unhandled-error';

describe('MachineUnhandledError', () => {
	it('creates an instance', () => {
		const error = new MachineUnhandledError('message', 'cause', '0x12345');

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(MachineUnhandledError);
		expect(error.message).toBe('message');
		expect(error.cause).toBe('cause');
		expect(error.stepId).toBe('0x12345');
	});
});
