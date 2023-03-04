import { BranchedStep } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';
import { BranchNameResult } from '../results/branch-name-result';

export type ForkActivityHandlerResult = InterruptResult | BranchNameResult;
export type ForkActivityHandler<TStep extends BranchedStep, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<ForkActivityHandlerResult>;

export interface ForkActivityConfig<TStep extends BranchedStep, GlobalState, ActivityState> extends ActivityConfig<TStep> {
	init: ActivityStateInitializer<GlobalState, ActivityState>;
	handler: ForkActivityHandler<TStep, GlobalState, ActivityState>;
}

export interface ForkActivityState<ActivityState> {
	targetBranchName?: string;
	activityState: ActivityState;
}
