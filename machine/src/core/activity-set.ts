import { Activity } from '../types';

export class ActivitySet<TGlobalState> {
	public constructor(private readonly activities: Map<string, Activity<TGlobalState>>) {}

	public get(stepType: string): Activity<TGlobalState> {
		const provider = this.activities.get(stepType);
		if (!provider) {
			throw new Error(`Cannot find activity for step type: ${stepType}`);
		}
		return provider;
	}
}

export function createActivitySet<TGlobalState>(activities: Activity<TGlobalState>[]): ActivitySet<TGlobalState> {
	const map = new Map<string, Activity<TGlobalState>>();
	for (const activity of activities) {
		if (map.has(activity.stepType)) {
			throw new Error(`Duplicate step type: ${activity.stepType}`);
		}
		map.set(activity.stepType, activity);
	}
	return new ActivitySet(map);
}
