import { readStatePaths } from './state-path-reader';

describe('readStatePath()', () => {
	it('returns correct value for string', () => {
		const path = readStatePaths('MAIN');
		expect(path.length).toEqual(1);
		expect(path[0]).toStrictEqual(['MAIN']);
	});

	it('returns correct value for object', () => {
		const value = { MAIN: { _0x1: 'WAIT_FOR_SIGNAL' } };
		const path = readStatePaths(value);
		expect(path.length).toEqual(1);
		expect(path[0][0]).toEqual('MAIN');
		expect(path[0][1]).toEqual('_0x1');
		expect(path[0][2]).toEqual('WAIT_FOR_SIGNAL');
	});

	it('returns correct path', () => {
		const path = readStatePaths({
			MAIN: {
				PX: {
					PARALLEL: {
						BRANCH_0: {
							SEQUENCE: 'STEP_alfa_2'
						},
						BRANCH_1: {
							SEQUENCE: 'STEP_beta_1'
						},
						BRANCH_2: 'LEAVE',
						BRANCH_3: 'LEAVE'
					}
				}
			}
		});

		expect(path.length).toEqual(4);
		expect(path[0]).toStrictEqual(['MAIN', 'PX', 'PARALLEL', 'BRANCH_0', 'SEQUENCE', 'STEP_alfa_2']);
		expect(path[1]).toStrictEqual(['MAIN', 'PX', 'PARALLEL', 'BRANCH_1', 'SEQUENCE', 'STEP_beta_1']);
		expect(path[2]).toStrictEqual(['MAIN', 'PX', 'PARALLEL', 'BRANCH_2', 'LEAVE']);
		expect(path[3]).toStrictEqual(['MAIN', 'PX', 'PARALLEL', 'BRANCH_3', 'LEAVE']);
	});
});
