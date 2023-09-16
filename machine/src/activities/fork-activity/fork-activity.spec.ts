import { createAtomActivity } from '../atom-activity/atom-activity';
import { createActivitySet } from '../../core/activity-set';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { createForkActivity } from './fork-activity';
import { BranchedStep, Definition, Step } from 'sequential-workflow-model';
import { interrupt } from '../results/interrupt-result';
import { branchName } from '../results/branch-name-result';
import { skip } from '../results';

interface TestGlobalState {
	mode: string;
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
	createAtomActivity('appendMessage', {
		init: () => ({}),
		handler: async (step, globalState) => {
			globalState.message += step.properties['appendMessage'];
		}
	}),
	createForkActivity<BranchedStep, TestGlobalState>('if', {
		init: () => ({}),
		handler: async (_, globalState) => {
			if (globalState.mode === '[interrupt]') {
				return interrupt();
			}
			if (globalState.mode === '[fail]') {
				throw new Error('TEST_ERROR');
			}
			if (globalState.mode === '[true]') {
				return branchName('true');
			}
			if (globalState.mode === '[false]') {
				return branchName('false');
			}
			if (globalState.mode === '[skip]') {
				return skip();
			}
			throw new Error('Unknown mode');
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
			mode: '[false]',
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
			mode: '[true]',
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isFinished()).toBe(true);
			expect(snapshot.globalState.message).toBe('(start)(true)(end)');

			done();
		});
		interpreter.start();
	});

	it('should interrupt', done => {
		const startGlobalState: TestGlobalState = {
			mode: '[interrupt]',
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isInterrupted()).toBe(true);
			expect(snapshot.globalState.message).toBe('(start)');

			done();
		});
		interpreter.start();
	});

	it('should skip', done => {
		const startGlobalState: TestGlobalState = {
			mode: '[skip]',
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isFinished()).toBe(true);
			expect(snapshot.isInterrupted()).toBe(false);
			expect(snapshot.isFailed()).toBe(false);
			expect(snapshot.globalState.message).toBe('(start)(end)');

			done();
		});
		interpreter.start();
	});

	it('should fail', done => {
		const startGlobalState: TestGlobalState = {
			mode: '[fail]',
			message: ''
		};

		const interpreter = run(definition, startGlobalState);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isFailed()).toBe(true);
			expect(snapshot.isInterrupted()).toBe(false);
			expect(snapshot.isFinished()).toBe(false);
			expect(snapshot.unhandledError?.message).toBe('TEST_ERROR');
			expect(snapshot.unhandledError?.stepId).toBe('0x002');
			expect(snapshot.globalState.message).toBe('(start)');

			done();
		});
		interpreter.start();
	});
});
