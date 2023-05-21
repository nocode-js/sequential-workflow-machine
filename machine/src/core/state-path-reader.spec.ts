import { readStatePath } from './state-path-reader';

describe('readStatePath()', () => {
	it('returns correct value for string', () => {
		expect(readStatePath('MAIN')[0]).toBe('MAIN');
	});

	it('returns correct value for object', () => {
		const value = { MAIN: { _0x1: 'WAIT_FOR_SIGNAL' } };
		const path = readStatePath(value);
		expect(path[0]).toBe('MAIN');
		expect(path[1]).toBe('_0x1');
		expect(path[2]).toBe('WAIT_FOR_SIGNAL');
	});
});
