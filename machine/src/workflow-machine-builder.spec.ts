import { createActivitySet } from './core';
import { createWorkflowMachineBuilder } from './workflow-machine-builder';

describe('createWorkflowMachineBuilder', () => {
	it('creates an instance of the builder', () => {
		const activitySet = createActivitySet([]);
		const builder = createWorkflowMachineBuilder(activitySet);

		expect(builder).toBeDefined();
	});
});
