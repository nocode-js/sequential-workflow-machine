import { Definition } from 'sequential-workflow-model';
import { createActivitySet } from './core';
import { createWorkflowMachineBuilder } from './workflow-machine-builder';

interface TestGlobalState {
	value: number;
}

describe('WorkflowMachine', () => {
	it('start() creates new instances', done => {
		const definition: Definition = {
			properties: {},
			sequence: []
		};

		const activitySet = createActivitySet<TestGlobalState>([]);

		const workflowMachine = createWorkflowMachineBuilder(activitySet);
		const machine = workflowMachine.build(definition);
		let finished = 0;

		const instance1 = machine.create({
			init: () => ({ value: 100 })
		});
		const instance2 = machine.create({
			init: () => ({ value: 200 })
		});

		expect(instance1).not.toBe(instance2);
		expect(instance1.getSnapshot().globalState.value).toBe(100);
		expect(instance2.getSnapshot().globalState.value).toBe(200);

		function onDone() {
			if (++finished === 2) {
				done();
			}
		}
		instance1.onDone(onDone).start();
		instance2.onDone(onDone).start();
	});
});
