import { InvokeMeta } from 'xstate';
import { readMetaPath } from './meta-path-reader';

describe('readMetaPath()', () => {
	it('returns step name', () => {
		const meta = {
			src: {
				type: '(machine).MAIN.STEP_0x002.CONDITION:invocation[0]'
			}
		} as InvokeMeta;
		expect(readMetaPath(meta)).toBe('0x002');
	});

	it('returns step name', () => {
		const meta = {
			src: {
				type: '(machine).MAIN.STEP_0x001.STEP_0x005.CONDITION:invocation[0]'
			}
		} as InvokeMeta;
		expect(readMetaPath(meta)).toBe('0x005');
	});

	it('returns step name', () => {
		const meta = {
			src: {
				type: 'STEP_0x2:invocation[0]'
			}
		} as InvokeMeta;
		expect(readMetaPath(meta)).toBe('0x2');
	});

	it('returns null', () => {
		const meta = {
			src: {
				type: '(machine)'
			}
		} as InvokeMeta;
		expect(readMetaPath(meta)).toBe(null);
	});

	it('returns null', () => {
		const meta = {
			src: {
				type: 'machine.MAIN'
			}
		} as InvokeMeta;
		expect(readMetaPath(meta)).toBe(null);
	});
});
