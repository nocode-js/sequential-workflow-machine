import { createActivitySet } from './activity-set';

describe('ActivitySet', () => {
	const nodeBuilderFactory = () => {
		throw new Error('Not implemented');
	};

	const activitySet = createActivitySet([
		{ stepType: 'writeEmail', nodeBuilderFactory },
		{ stepType: 'sendEmail', nodeBuilderFactory }
	]);

	it('returns the correct activity', () => {
		const activity = activitySet.get('sendEmail');
		expect(activity.stepType).toEqual('sendEmail');
	});

	it('return types', () => {
		const types = activitySet.getTypes();
		expect(types.length).toEqual(2);
		expect(types).toContain('writeEmail');
		expect(types).toContain('sendEmail');
	});

	it('throws an error if the activity is not found', () => {
		expect(() => activitySet.get('notFound')).toThrowError('Cannot find activity for step type: notFound');
	});
});
