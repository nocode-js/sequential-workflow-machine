import { createAtomActivity } from './atom-activity';
import { createActivitySet } from '../../core/activity-set';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { STATE_FINISHED_ID, STATE_INTERRUPTED_ID, STATE_FAILED_ID } from '../../types';
import { Definition, Step } from 'sequential-workflow-model';
import { interrupt } from '../results/interrupt-result';

interface TestGlobalState {
	counter: number;
}

interface SetCounterStep extends Step {
	type: 'setCounter';
	properties: {
		value: number;
	};
}

const activitySet = createActivitySet<TestGlobalState>([
	createAtomActivity<SetCounterStep, TestGlobalState, { x: number }>({
		stepType: 'setCounter',
		init: () => ({ x: 987654321 }),
		handler: async (step, globalState, activityState) => {
			expect(activityState.x).toBe(987654321);
			globalState.counter = step.properties.value;
		}
	}),
	createAtomActivity<Step, TestGlobalState, null>({
		stepType: 'multiply2',
		init: () => null,
		handler: async (_, globalState) => {
			globalState.counter *= 2;
		}
	}),
	createAtomActivity<Step, TestGlobalState, null>({
		stepType: 'interrupt',
		init: () => null,
		handler: async () => {
			return interrupt();
		}
	}),
	createAtomActivity<Step, TestGlobalState, null>({
		stepType: 'error',
		init: () => null,
		handler: async () => {
			throw new Error('TEST_ERROR');
		}
	})
]);

function run(definition: Definition) {
	const builder = createWorkflowMachineBuilder(activitySet);
	return builder.build(definition).create({
		init: () => ({
			counter: 0
		})
	});
}

describe('AtomActivity', () => {
	it('should execute 2 simple activities', done => {
		const set10Step: SetCounterStep = {
			id: '0x1',
			componentType: 'task',
			type: 'setCounter',
			name: 'Set 10',
			properties: {
				value: 10
			}
		};
		const multiply2: Step = {
			id: '0x2',
			componentType: 'task',
			type: 'multiply2',
			name: 'Multiple x2',
			properties: {}
		};
		const definition: Definition = {
			sequence: [set10Step, multiply2],
			properties: {}
		};

		const interpreter = run(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_FINISHED_ID);
			expect(snapshot.globalState.counter).toBe(20);

			done();
		});
		interpreter.start();
	});

	it('should interrupt execution', done => {
		const definition: Definition = {
			sequence: [
				{
					id: '0x2',
					componentType: 'task',
					type: 'interrupt',
					name: 'Interrupt',
					properties: {}
				}
			],
			properties: {}
		};

		const interpreter = run(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_INTERRUPTED_ID);
			expect(snapshot.globalState.counter).toBe(0);

			done();
		});
		interpreter.start();
	});

	it('should stop execution on error', done => {
		const definition: Definition = {
			sequence: [
				{
					id: '0x2',
					componentType: 'task',
					type: 'error',
					name: 'Error',
					properties: {}
				}
			],
			properties: {}
		};

		const interpreter = run(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.statePath[0]).toBe(STATE_FAILED_ID);
			expect(snapshot.unhandledError).toBeInstanceOf(Error);
			expect((snapshot.unhandledError as Error).message).toBe('TEST_ERROR');

			done();
		});
		interpreter.start();
	});
});
