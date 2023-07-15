import { createActivitySet } from '../../core';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { createAtomActivity } from '../atom-activity';
import { createLoopActivity } from './loop-activity';
import { Definition, SequentialStep, Step } from 'sequential-workflow-model';

interface TestGlobalState {
	counter: number;
}

function createTaskStep(id: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'increment',
		name: `Increment`,
		properties: {}
	};
}

const definition: Definition = {
	sequence: [
		createTaskStep('0x001'),
		{
			id: '0x002',
			componentType: 'container',
			name: 'Loop',
			type: 'loop',
			properties: {},
			sequence: [createTaskStep('0x003')]
		} as SequentialStep,
		createTaskStep('0x004')
	],
	properties: {}
};

const activitySet = createActivitySet<TestGlobalState>([
	createAtomActivity('increment', {
		init: () => ({}),
		handler: async (_, globalState) => {
			globalState.counter++;
		}
	}),
	createLoopActivity<SequentialStep, TestGlobalState>('loop', {
		loopName: () => 'loop',
		init: () => ({}),
		condition: async (_, globalState) => {
			return globalState.counter < 3;
		}
	})
]);

const builder = createWorkflowMachineBuilder(activitySet);
const machine = builder.build(definition);

describe('LoopActivity', () => {
	it('should iterate', done => {
		const interpreter = machine
			.create({
				init: () => ({
					counter: 0
				})
			})
			.start();

		interpreter.onDone(() => {
			const globalState = interpreter.getSnapshot().globalState;

			expect(globalState.counter).toBe(4);

			done();
		});
	});
});
