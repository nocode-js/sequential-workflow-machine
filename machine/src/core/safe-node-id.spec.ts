import { getBranchNodeId, getStepNodeId } from './safe-node-id';

describe('getStepNodeId()', () => {
	it('returns safe id', () => {
		expect(getStepNodeId('some_id')).toBe('STEP_some_id');
	});
});

describe('getBranchNodeId()', () => {
	it('returns safe id', () => {
		expect(getBranchNodeId('someId', 'true')).toBe('BRANCH_someId_true');
	});
});
