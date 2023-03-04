import { Activity } from '../types';

export class ActivitySet<GlobalState> {
	public constructor(private readonly activities: Map<string, Activity<GlobalState>>) {}

	public get(stepType: string): Activity<GlobalState> {
		const provider = this.activities.get(stepType);
		if (!provider) {
			throw new Error(`Cannot find activity for step type: ${stepType}`);
		}
		return provider;
	}
}

export function createActivitySet<GlobalState>(activities: Activity<GlobalState>[]): ActivitySet<GlobalState> {
	const map = new Map<string, Activity<GlobalState>>();
	for (const activity of activities) {
		if (map.has(activity.stepType)) {
			throw new Error(`Duplicate step type: ${activity.stepType}`);
		}
		map.set(activity.stepType, activity);
	}
	return new ActivitySet(map);
}
