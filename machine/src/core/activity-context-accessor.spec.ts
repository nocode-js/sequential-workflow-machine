import { MachineContext } from '../types';
import { ActivityStateAccessor } from './activity-context-accessor';

describe('ActivityStateAccessor()', () => {
	it('returns the same instance for the same id', () => {
		const machineContext: MachineContext<object> = {
			activityStates: {},
			globalState: {}
		};

		const accessor = new ActivityStateAccessor(() => ({
			value: Math.random()
		}));

		const instance1 = accessor.get(machineContext, '0x00001');
		const instance2 = accessor.get(machineContext, '0x00001');

		expect(instance1).toBe(instance2);
		expect(instance1.value).toBe(instance2.value);
	});
});
