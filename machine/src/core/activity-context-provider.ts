import { Step } from 'sequential-workflow-model';
import { ActivityStateInitializer, MachineContext } from '../types';

export class ActivityStateProvider<TStep extends Step, TGlobalState, TActivityState extends object> {
	public constructor(
		private readonly step: TStep,
		private readonly init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>
	) {}

	public get(context: MachineContext<TGlobalState>, nodeId: string): TActivityState {
		let activityState = context.activityStates[nodeId] as TActivityState | undefined;
		if (!activityState) {
			activityState = this.init(this.step, context.globalState);
			context.activityStates[nodeId] = activityState;
		}
		return activityState;
	}
}
