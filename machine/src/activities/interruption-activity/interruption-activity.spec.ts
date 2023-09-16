import { createActivitySet } from '../../core/activity-set';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { Definition, Step } from 'sequential-workflow-model';
import { createInterruptionActivity } from './interruption-activity';

interface TestGlobalState {
	called: boolean;
}

const activitySet = createActivitySet<TestGlobalState>([
	createInterruptionActivity<Step, TestGlobalState>('interrupt', {
		handler: async (_, globalState) => {
			globalState.called = true;
		}
	})
]);

function run(definition: Definition) {
	const builder = createWorkflowMachineBuilder(activitySet);
	return builder.build(definition).create({
		init: () => ({
			called: false
		})
	});
}

describe('InterruptionActivity', () => {
	it('interrupts', done => {
		const interruptStep: Step = {
			id: '0x1',
			componentType: 'task',
			type: 'interrupt',
			name: 'Interrupt',
			properties: {}
		};
		const definition: Definition = {
			sequence: [interruptStep],
			properties: {}
		};

		const interpreter = run(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isInterrupted()).toBe(true);
			expect(snapshot.isFinished()).toBe(false);
			expect(snapshot.isFailed()).toBe(false);
			expect(snapshot.globalState.called).toBe(true);

			done();
		});
		interpreter.start();
	});
});
