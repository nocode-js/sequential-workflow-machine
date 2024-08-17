import { Definition, Step } from 'sequential-workflow-model';
import { createSignalActivity, signalSignalActivity } from './signal-activity';
import { createActivitySet } from '../../core';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { createAtomActivityFromHandler } from '../atom-activity';
import { SerializedWorkflowMachineSnapshot } from '../../types';

interface TestGlobalState {
	logs: string[];
}

const activitySet = createActivitySet<TestGlobalState>([
	createAtomActivityFromHandler<Step, TestGlobalState>('ping', async (step, globalState) => {
		globalState.logs.push(`ping:${step.name}`);
	}),
	createSignalActivity<Step, TestGlobalState>('waitForSignal', {
		init: () => ({}),
		beforeSignal: async (step, globalState) => {
			globalState.logs.push(`beforeSignal:${step.name}`);
		},
		afterSignal: async (step, globalState) => {
			globalState.logs.push(`afterSignal:${step.name}`);
		}
	})
]);

function createPingStep(id: string, name: string): Step {
	return {
		id,
		componentType: 'task',
		type: 'ping',
		name,
		properties: {}
	};
}

describe('SignalActivity - persistence', () => {
	it('saves state, restores state', done => {
		const definition: Definition = {
			sequence: [
				createPingStep('0x1', 'p1'),
				{
					id: '0x2',
					componentType: 'task',
					type: 'waitForSignal',
					name: 'w1',
					properties: {}
				},
				createPingStep('0x3', 'p2'),
				createPingStep('0x4', 'p3')
			],
			properties: {}
		};

		const builder = createWorkflowMachineBuilder(activitySet);
		const machine = builder.build(definition);

		let isIsInstance1Stopped = false;

		function runInstance2(serializedSnapshot: SerializedWorkflowMachineSnapshot<TestGlobalState>) {
			const size = JSON.stringify(serializedSnapshot).length;

			expect(size).toBe(2395);

			const interpreter = machine.deserializeSnapshot(serializedSnapshot);
			const paths: (string[] | null)[] = [];

			interpreter.onChange(() => {
				const path = interpreter.getSnapshot().tryGetStatePath();
				paths.push(path);
				if (path && path.includes('WAIT_FOR_SIGNAL')) {
					expect(paths.length).toBe(1); // First path should be the same as the one from the serialized snapshot
					signalSignalActivity(interpreter, {});
				}
			});
			interpreter.onDone(() => {
				const snapshot = interpreter.getSnapshot();
				expect(isIsInstance1Stopped).toBe(true);
				expect(snapshot.globalState.logs).toEqual(['ping:p1', 'beforeSignal:w1', 'afterSignal:w1', 'ping:p2', 'ping:p3']);
				expect(paths).toStrictEqual([
					['MAIN', 'STEP_0x2', 'WAIT_FOR_SIGNAL'],
					['MAIN', 'STEP_0x2', 'AFTER_SIGNAL'],
					['MAIN', 'STEP_0x3'],
					['MAIN', 'STEP_0x4'],
					['FINISHED']
				]);
				done();
			});
			interpreter.start();
		}

		function runInstance1() {
			const interpreter = machine.create({
				init: () => ({
					logs: []
				})
			});
			const paths: (string[] | null)[] = [];

			interpreter.onChange(() => {
				const snapshot = interpreter.getSnapshot();
				const path = snapshot.tryGetStatePath();
				paths.push(path);

				if (path && path.includes('WAIT_FOR_SIGNAL')) {
					expect(snapshot.globalState.logs).toEqual(['ping:p1', 'beforeSignal:w1']);
					expect(paths).toStrictEqual([
						['MAIN', 'STEP_0x1'],
						['MAIN', 'STEP_0x2', 'BEFORE_SIGNAL'],
						['MAIN', 'STEP_0x2', 'WAIT_FOR_SIGNAL']
					]);
					runInstance2(interpreter.serializeSnapshot());
					expect(interpreter.isRunning()).toBe(true);
					expect(interpreter.tryStop()).toBe(true);
				}
			});
			interpreter.onDone(() => {
				const snapshot = interpreter.getSnapshot();
				const path = snapshot.tryGetStatePath();
				expect(path).toStrictEqual(['MAIN', 'STEP_0x2', 'WAIT_FOR_SIGNAL']);
				isIsInstance1Stopped = true;
			});
			interpreter.start();
		}

		runInstance1();
	});
});
