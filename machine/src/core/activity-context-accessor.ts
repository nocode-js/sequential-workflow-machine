import { ActivityStateInitializer, MachineContext } from '../types';

export class ActivityStateAccessor<GlobalState, ActivityState> {
	public constructor(private readonly init: ActivityStateInitializer<GlobalState, ActivityState>) {}

	public get(context: MachineContext<GlobalState>, nodeId: string): ActivityState {
		let activityState = context.activityStates[nodeId] as ActivityState | undefined;
		if (!activityState) {
			activityState = this.init(context.globalState);
			context.activityStates[nodeId] = activityState;
		}
		return activityState;
	}
}
