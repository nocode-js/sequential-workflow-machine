import { Definition, Step } from 'sequential-workflow-model';
import { createSignalActivity, signalSignalActivity } from './signal-activity';
import { createActivitySet } from '../../core';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { STATE_FINISHED_ID } from '../../types';

interface TestGlobalState {
	beforeCalled: boolean;
	afterCalled: boolean;
}

const activitySet = createActivitySet<TestGlobalState>([
	createSignalActivity<Step, TestGlobalState>('waitForSignal', {
		init: () => ({}),
		beforeSignal: async (_, globalState) => {
			expect(globalState.beforeCalled).toBe(false);
			expect(globalState.afterCalled).toBe(false);
			globalState.beforeCalled = true;
		},
		afterSignal: async (_, globalState, __, payload) => {
			expect(globalState.beforeCalled).toBe(true);
			expect(globalState.afterCalled).toBe(false);
			globalState.afterCalled = true;
			expect(payload['TEST_VALUE']).toBe(123456);
			expect(Object.keys(payload).length).toBe(1);
		}
	})
]);

describe('SignalActivity', () => {
	it('stops, after signal continues', done => {
		const definition: Definition = {
			sequence: [
				{
					id: '0x1',
					componentType: 'task',
					type: 'waitForSignal',
					name: 'W8',
					properties: {}
				}
			],
			properties: {}
		};

		const builder = createWorkflowMachineBuilder(activitySet);
		const machine = builder.build(definition);
		const interpreter = machine.create({
			init: () => ({
				afterCalled: false,
				beforeCalled: false
			})
		});

		interpreter.onChange(() => {
			const snapshot = interpreter.getSnapshot();

			if (snapshot.tryGetStatePath()?.includes('WAIT_FOR_SIGNAL')) {
				expect(snapshot.globalState.beforeCalled).toBe(true);
				expect(snapshot.globalState.afterCalled).toBe(false);

				setTimeout(() => {
					signalSignalActivity(interpreter, {
						TEST_VALUE: 123456
					});
				}, 25);
			}
		});

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();

			expect(snapshot.tryGetStatePath()).toStrictEqual([STATE_FINISHED_ID]);
			expect(snapshot.globalState.beforeCalled).toBe(true);
			expect(snapshot.globalState.afterCalled).toBe(true);

			done();
		});

		interpreter.start();
	});
});
