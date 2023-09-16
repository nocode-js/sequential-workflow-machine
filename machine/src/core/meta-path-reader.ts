import { InvokeMeta } from 'xstate';
import { STATE_STEP_ID_PREFIX } from './safe-node-id';

export function readMetaPath(meta: InvokeMeta): string | null {
	const path = meta.src.type;
	let start = path.lastIndexOf(STATE_STEP_ID_PREFIX);
	if (start < 0) {
		return null;
	}
	start += STATE_STEP_ID_PREFIX.length;
	let end = path.indexOf('.', start);
	if (end < 0) {
		end = path.indexOf(':', start);
	}
	return end < 0 ? path.substring(start) : path.substring(start, end);
}
