import { Definition, SequentialStep, Step } from 'sequential-workflow-model';
import { WorkflowMachineInterpreter } from './workflow-machine-interpreter';
import { createActivitySet } from './core';
import { createWorkflowMachineBuilder } from './workflow-machine-builder';
import { createAtomActivityFromHandler, createLoopActivity } from './activities';

interface TestGlobalState {
	mode: string;
	value: number;
}

const definition: Definition = {
	properties: {},
	sequence: [
		{
			id: '0xloop',
			componentType: 'container',
			name: 'loop',
			type: 'loop',
			properties: {},
			sequence: [
				{
					type: 'ping',
					componentType: 'task',
					name: 'ping',
					id: '0xping',
					properties: {}
				}
			]
		} as SequentialStep
	]
};

const loopActivity = createLoopActivity<SequentialStep, TestGlobalState>('loop', {
	condition: async () => true,
	init: () => ({}),
	loopName: () => 'loop'
});

const pingActivity = createAtomActivityFromHandler<Step, TestGlobalState>('ping', async (_, g) => {
	await sleep(2);
	g.value++;
});

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('WorkflowMachineInterpreter', () => {
	describe('tryStop()', () => {
		let interpreter: WorkflowMachineInterpreter<TestGlobalState>;

		beforeEach(() => {
			const activitySet = createActivitySet<TestGlobalState>([loopActivity, pingActivity]);
			const workflowMachine = createWorkflowMachineBuilder(activitySet);
			const machine = workflowMachine.build(definition);

			interpreter = machine.create({
				init: () => ({
					mode: 'increment',
					value: 0
				})
			});
			interpreter.start();
		});

		it('can stop from outside', done => {
			interpreter.onDone(() => {
				const context = interpreter.getSnapshot();

				expect(context.isFailed()).toBe(false);
				expect(context.isInterrupted()).toBe(false);
				expect(context.isFinished()).toBe(false);
				done();
			});

			setTimeout(() => {
				interpreter.tryStop();
			}, 100);
		});

		it('can stop from onChange', done => {
			let onChangeCalledAfterStop = 0;

			interpreter.onChange(() => {
				const snapshot = interpreter.getSnapshot();
				if (snapshot.globalState.value > 10) {
					interpreter.tryStop();
					onChangeCalledAfterStop++;
				}
			});
			interpreter.onDone(() => {
				const context = interpreter.getSnapshot();

				expect(context.isFailed()).toBe(false);
				expect(context.isFinished()).toBe(false);
				expect(context.isInterrupted()).toBe(false);
				expect(onChangeCalledAfterStop).toBe(0);
				done();
			});
		});

		it('cannot stop two times', () => {
			expect(interpreter.tryStop()).toBe(true);
			expect(interpreter.tryStop()).toBe(false);
		});
	});
});
