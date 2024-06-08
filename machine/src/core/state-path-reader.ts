import { StateValue } from 'xstate';

export function readStatePaths(stateValue: StateValue): string[][] {
	const result: string[][] = [];
	processPath(result, [], stateValue);
	return result;
}

function processPath(result: string[][], path: string[], stateValue: StateValue) {
	if (typeof stateValue === 'string') {
		path.push(stateValue);
		result.push(path);
	} else if (typeof stateValue === 'object') {
		const keys = Object.keys(stateValue);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const childPath = i === key.length - 1 ? path : [...path, key];
			processPath(result, childPath, stateValue[key]);
		}
	} else {
		throw new Error('Invalid state value');
	}
}
