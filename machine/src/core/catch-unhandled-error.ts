import { EventObject } from 'xstate';
import { MachineContext } from '../types';

export function catchUnhandledError<TGlobalState>(callback: (context: MachineContext<TGlobalState>, event: EventObject) => Promise<void>) {
	return async (context: MachineContext<TGlobalState>, event: EventObject) => {
		try {
			await callback(context, event);
		} catch (e) {
			context.unhandledError = e;
			throw e;
		}
	};
}
