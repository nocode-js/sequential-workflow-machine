import { InvokeMeta } from 'xstate';
import { MachineContext } from '../types';
import { catchUnhandledError } from './catch-unhandled-error';

describe('catchUnhandledError()', () => {
	it('sets an error to the context', done => {
		const context: MachineContext<object> = {
			activityStates: {},
			globalState: {}
		};
		const event = { type: 'x' };
		const meta = { src: { type: '(machine).MAIN.STEP_0x002.CONDITION:invocation[0]' } } as InvokeMeta;

		catchUnhandledError(async () => {
			throw new Error('SOME_ERROR');
		})(context, event, meta).catch(e => {
			expect((e as Error).message).toBe('SOME_ERROR');
			expect(context.unhandledError?.cause).toBe(e);
			expect(context.unhandledError?.message).toBe('SOME_ERROR');
			expect(context.unhandledError?.stepId).toBe('0x002');
			done();
		});
	});
});
