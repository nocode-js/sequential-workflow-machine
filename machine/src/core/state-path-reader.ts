import { StateValue } from 'xstate';

export function readStatePath(stateValue: StateValue): string[] {
	if (typeof stateValue === 'string') {
		return [stateValue];
	}
	const path: string[] = [];
	let current: StateValue = stateValue;
	while (typeof current === 'object') {
		const keys: string[] = Object.keys(current);
		if (keys.length !== 1) {
			throw new Error('Invalid state value');
		}
		path.push(keys[0]);
		current = current[keys[0]];
	}
	path.push(current);
	return path;
}
