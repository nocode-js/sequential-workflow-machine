import { createAtomActivity } from '../atom-activity/atom-activity';
import { createActivitySet } from '../../core/activity-set';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { createForkActivity } from './fork-activity';
import { STATE_FAILED_ID, STATE_FINISHED_ID, STATE_INTERRUPTED_ID } from '../../types';
import { BranchedStep, Definition, Step } from 'sequential-workflow-model';
import { interrupt } from '../results/interrupt-result';
import { branchName } from '../results/branch-name-result';

interface TestGlobalState {
	temperature: number;
	message: string;
}

function createTaskStep(id: string, appendMessage: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'appendMessage',
		name: `Append ${appendMessage}`,
		properties: {
			appendMessage
		}
	};
}

const definition: Definition = {
	sequence: [
		createTaskStep('0x001', '(start)'),
		{
			id: '0x002',
			componentType: 'switch',
			name: 'If',
			type: 'if',
			properties: {},
			branches: {
				true: [createTaskStep('0x003', '(true)')],
				false: [createTaskStep('0x004', '(false)')]
			}
		} as BranchedStep,
		createTaskStep('0x005', '(end)')
	],
	properties: {}
};

const activitySet = createActivitySet<TestGlobalState>([
	createAtomActivity({
		stepType: 'appendMessage',
		init: () => ({}),
		handler: async (step, globalState) => {
			globalState.message += step.properties['appendMessage'];
		}
	}),
	createForkActivity<BranchedStep, TestGlobalState>({
		stepType: 'if',
		init: () => ({}),
		handler: async (_, globalState) => {
			if (isNaN(globalState.temperature)) {
				throw new Error('TEST_ERROR');
			}
			if (globalState.temperature < 0) {
				return interrupt();
			}
			if (globalState.temperature > 10) {
				return branchName('true');
			}
			return branchName('false');
		}
	})
]);

function run(definition: Definition, startGlobalState: TestGlobalState) {
	const builder = createWorkflowMachineBuilder(activitySet);
	const machine = builder.build(definition);
	return machine.create({
		init: () => startGlobalState
	});
}

describe('ForkActivity', () => {
	it('should go by false branch', done => {
		const startGlobalState: TestGlobalState = {
			temperature: 0,
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const globalState = interpreter.getSnapshot().globalState;

			expect(globalState.message).toBe('(start)(false)(end)');

			done();
		});
		interpreter.start();
	});

	it('should go by true branch', done => {
		const startGlobalState: TestGlobalState = {
			temperature: 20,
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_FINISHED_ID);
			expect(snapshot.globalState.message).toBe('(start)(true)(end)');

			done();
		});
		interpreter.start();
	});

	it('should interrupt', done => {
		const startGlobalState: TestGlobalState = {
			temperature: -20,
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_INTERRUPTED_ID);
			expect(snapshot.globalState.message).toBe('(start)');

			done();
		});
		interpreter.start();
	});

	it('should fail', done => {
		const startGlobalState: TestGlobalState = {
			temperature: NaN,
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_FAILED_ID);
			expect((snapshot.unhandledError as Error).message).toBe('TEST_ERROR');
			expect(snapshot.globalState.message).toBe('(start)');

			done();
		});
		interpreter.start();
	});
});
