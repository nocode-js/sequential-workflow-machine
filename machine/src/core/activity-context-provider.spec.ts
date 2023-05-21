import { Step } from 'sequential-workflow-model';
import { MachineContext } from '../types';
import { ActivityStateProvider } from './activity-context-provider';

describe('ActivityStateProvider()', () => {
	it('returns the same instance for the same id', () => {
		const machineContext: MachineContext<object> = {
			activityStates: {},
			globalState: {}
		};
		const step: Step = {
			id: '0x1',
			componentType: 'task',
			type: 'test',
			name: 'Test',
			properties: {}
		};
		const nodeId = step.id;

		const provider = new ActivityStateProvider(step, s => {
			expect(s).toBe(step);
			return {
				value: Math.random()
			};
		});

		const instance1 = provider.get(machineContext, nodeId);
		const instance2 = provider.get(machineContext, nodeId);

		expect(instance1).toBe(instance2);
		expect(instance1.value).toBe(instance2.value);
	});
});
