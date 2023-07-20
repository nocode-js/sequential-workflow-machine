import { createActivitySet } from '../../core';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { createAtomActivity } from '../atom-activity';
import { createLoopActivity } from './loop-activity';
import { Definition, SequentialStep, Step } from 'sequential-workflow-model';

interface TestGlobalState {
	counter: number;
	trace: string;
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
		onEnter: (_, globalState) => {
			return new Promise(resolve => {
				setTimeout(() => {
					globalState.trace += '(onEnter)';
					resolve();
				}, 10);
			});
		},
		onLeave: (_, globalState) => {
			return new Promise(resolve => {
				setTimeout(() => {
					globalState.trace += '(onLeave)';
					resolve();
				}, 10);
			});
		},
		condition: async (_, globalState) => {
			globalState.trace += '(condition)';
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
					counter: 0,
					trace: ''
				})
			})
			.start();

		interpreter.onDone(() => {
			const globalState = interpreter.getSnapshot().globalState;

			expect(globalState.counter).toBe(4);
			expect(globalState.trace).toBe('(onEnter)(condition)(condition)(condition)(onLeave)');

			done();
		});
	});
});
