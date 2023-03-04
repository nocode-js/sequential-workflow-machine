import { MachineContext } from '../types';
import { catchUnhandledError } from './catch-unhandled-error';

describe('catchUnhandledError()', () => {
	it('sets an error to the context', done => {
		const context: MachineContext<object> = {
			activityStates: {},
			globalState: {}
		};

		catchUnhandledError(async () => {
			throw new Error('SOME_ERROR');
		})(context, { type: 'x' }).catch(e => {
			expect((e as Error).message).toBe('SOME_ERROR');
			expect(context.unhandledError).toBe(e);
			done();
		});
	});
});
