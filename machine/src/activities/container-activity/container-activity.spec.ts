import { createActivitySet } from '../../core/activity-set';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { Definition, SequentialStep, Step } from 'sequential-workflow-model';
import { createContainerActivity } from './container-activity';
import { createAtomActivity } from '../atom-activity';

interface TestGlobalState {
	counter: number;
	entered: boolean;
	leaved: boolean;
}

const activitySet = createActivitySet<TestGlobalState>([
	createContainerActivity<SequentialStep, TestGlobalState>('block', {
		init: () => ({}),
		onEnter: async (_, globalState) => {
			globalState.entered = true;
		},
		onLeave: async (_, globalState) => {
			globalState.leaved = true;
		}
	}),
	createAtomActivity<Step, TestGlobalState>('increase', {
		init: () => ({}),
		handler: async (_, globalState) => {
			globalState.counter++;
		}
	})
]);

function createIncreaseStep(id: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'increase',
		name: 'Increase',
		properties: {}
	};
}

function build(definition: Definition) {
	const builder = createWorkflowMachineBuilder(activitySet);
	return builder.build(definition).create({
		init: () => ({
			counter: 0,
			entered: false,
			leaved: false
		})
	});
}

describe('ContainerActivity', () => {
	it('interrupts', done => {
		const sequentialStep: SequentialStep = {
			id: '0x1',
			componentType: 'container',
			type: 'block',
			name: 'block',
			properties: {},
			sequence: [createIncreaseStep('0x2'), createIncreaseStep('0x3')]
		};
		const definition: Definition = {
			sequence: [sequentialStep],
			properties: {}
		};

		const interpreter = build(definition);

		interpreter
			.onDone(() => {
				const snapshot = interpreter.getSnapshot();

				expect(snapshot.isFinished()).toBe(true);
				expect(snapshot.isInterrupted()).toBe(false);
				expect(snapshot.isFailed()).toBe(false);
				expect(snapshot.globalState.counter).toBe(2);
				expect(snapshot.globalState.entered).toBe(true);
				expect(snapshot.globalState.leaved).toBe(true);

				done();
			})
			.start();
	});
});
