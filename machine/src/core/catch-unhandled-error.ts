import { EventObject } from 'xstate';
import { MachineContext } from '../types';

export function catchUnhandledError<GlobalState>(callback: (context: MachineContext<GlobalState>, event: EventObject) => Promise<void>) {
	return async (context: MachineContext<GlobalState>, event: EventObject) => {
		try {
			await callback(context, event);
		} catch (e) {
			context.unhandledError = e;
			throw e;
		}
	};
}
