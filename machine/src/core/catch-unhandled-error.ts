import { EventObject, InvokeMeta } from 'xstate';
import { MachineContext } from '../types';
import { MachineUnhandledError } from '../machine-unhandled-error';
import { readMetaPath } from './meta-path-reader';

export function catchUnhandledError<TGlobalState>(
	callback: (context: MachineContext<TGlobalState>, event: EventObject, meta: InvokeMeta) => Promise<void>
) {
	return async (context: MachineContext<TGlobalState>, event: EventObject, meta: InvokeMeta) => {
		try {
			await callback(context, event, meta);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			const stepId = readMetaPath(meta);
			context.unhandledError = new MachineUnhandledError(message, e, stepId);
			throw e;
		}
	};
}
