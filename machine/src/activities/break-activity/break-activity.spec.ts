import { Definition, Sequence, SequentialStep, Step } from 'sequential-workflow-model';
import { createLoopActivity } from '../loop-activity/loop-activity';
import { createBreakActivity } from './break-activity';
import { createActivitySet } from '../../core';
import { createAtomActivity } from '../atom-activity';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { break_ } from './break-result';

interface TestGlobalState {
	alfa: number;
	trace: string;
}

function createLoopStep(id: string, loopName: string, sequence: Sequence): SequentialStep {
	return {
		id,
		componentType: 'container',
		type: 'loop',
		sequence,
		name: 'Loop',
		properties: {
			loopName
		}
	};
}

function createDecrementStep(id: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'decrement',
		name: 'Decrement',
		properties: {}
	};
}

function createBreakIfZeroStep(id: string, loopName: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'breakIfZero',
		name: 'Break',
		properties: {
			loopName
		}
	};
}

const definition: Definition = {
	sequence: [createLoopStep('0x001', 'LOOP_1', [createDecrementStep('0x002'), createBreakIfZeroStep('0x003', 'LOOP_1')])],
	properties: {}
};

const activitySet = createActivitySet<TestGlobalState>([
	createLoopActivity<SequentialStep, TestGlobalState>('loop', {
		loopName: step => String(step.properties['loopName']),
		init: () => ({}),
		condition: async (_, globalState) => {
			globalState.trace += '(condition)';
			return true;
		}
	}),

	createAtomActivity('decrement', {
		init: () => ({}),
		handler: async (_, globalState) => {
			globalState.trace += '(decrement)';
			globalState.alfa--;
		}
	}),

	createBreakActivity('breakIfZero', {
		init: () => ({}),
		handler: async (_, globalState) => {
			globalState.trace += '(break)';
			if (globalState.alfa === 0) {
				return break_();
			}
		},
		loopName: step => String(step.properties['loopName'])
	})
]);

describe('BreakActivity', () => {
	it('should break loop', done => {
		const builder = createWorkflowMachineBuilder(activitySet);
		const machine = builder.build(definition);
		const interpreter = machine
			.create({
				init: () => ({
					alfa: 3,
					trace: ''
				})
			})
			.start();

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.isFinished()).toBe(true);
			expect(snapshot.globalState.trace).toBe(
				'(condition)(decrement)(break)(condition)(decrement)(break)(condition)(decrement)(break)'
			);
			expect(snapshot.globalState.alfa).toBe(0);

			done();
		});
	});
});
