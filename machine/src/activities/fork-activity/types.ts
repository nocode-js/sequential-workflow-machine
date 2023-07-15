import { BranchedStep } from 'sequential-workflow-model';
import { ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';
import { BranchNameResult } from '../results/branch-name-result';

export type ForkActivityHandlerResult = InterruptResult | BranchNameResult;
export type ForkActivityHandler<TStep extends BranchedStep, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<ForkActivityHandlerResult>;

export interface ForkActivityConfig<TStep extends BranchedStep, TGlobalState, TActivityState extends object> {
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	handler: ForkActivityHandler<TStep, TGlobalState, TActivityState>;
}

export interface ForkActivityState<TActivityState> {
	targetBranchName?: string;
	activityState: TActivityState;
}
