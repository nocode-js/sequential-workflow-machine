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
		createTaskStep('task_a'),
		{
			id: 'loop',
			componentType: 'container',
			name: 'Loop',
			type: 'loop',
			properties: {},
			sequence: [createTaskStep('task_b')]
		} as SequentialStep,
		createTaskStep('task_c')
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
		const expectedRun = [
			{ id: 'loop', path: ['MAIN', 'STEP_loop', 'ENTER'] },
			{ id: 'loop', path: ['MAIN', 'STEP_loop', 'CONDITION'] },
			{
				id: 'task_b',
				path: ['MAIN', 'STEP_loop', 'LOOP', 'STEP_task_b']
			},
			{ id: 'loop', path: ['MAIN', 'STEP_loop', 'CONDITION'] },
			{
				id: 'task_b',
				path: ['MAIN', 'STEP_loop', 'LOOP', 'STEP_task_b']
			},
			{ id: 'loop', path: ['MAIN', 'STEP_loop', 'CONDITION'] },
			{ id: 'loop', path: ['MAIN', 'STEP_loop', 'LEAVE'] },
			{ id: 'task_c', path: ['MAIN', 'STEP_task_c'] },
			{ id: null, path: ['FINISHED'] }
		];
		const interpreter = machine
			.create({
				init: () => ({
					counter: 0,
					trace: ''
				})
			})
			.start();
		let index = 0;

		interpreter.onChange(() => {
			const snapshot = interpreter.getSnapshot();
			expect(snapshot.tryGetStatePath()).toMatchObject(expectedRun[index].path);
			expect(snapshot.tryGetCurrentStepId()).toBe(expectedRun[index].id);
			expect(snapshot.isFailed()).toBe(false);
			expect(snapshot.isFinished()).toBe(index === 8);
			expect(snapshot.isInterrupted()).toBe(false);
			index++;
		});
		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const globalState = snapshot.globalState;

			expect(index).toBe(9);
			expect(snapshot.isFinished()).toBe(true);
			expect(globalState.counter).toBe(4);
			expect(globalState.trace).toBe('(onEnter)(condition)(condition)(condition)(onLeave)');

			done();
		});
	});
});
