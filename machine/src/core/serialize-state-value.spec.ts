import { getStatePath } from './serialize-state-value';

describe('serializeStateValue()', () => {
	it('returns correct value for string', () => {
		expect(getStatePath('MAIN')[0]).toBe('MAIN');
	});

	it('returns correct value for object', () => {
		const value = { MAIN: { _0x1: 'WAIT_FOR_SIGNAL' } };
		const path = getStatePath(value);
		expect(path[0]).toBe('MAIN');
		expect(path[1]).toBe('_0x1');
		expect(path[2]).toBe('WAIT_FOR_SIGNAL');
	});
});
