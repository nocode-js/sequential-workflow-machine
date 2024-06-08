import { BranchedStep } from 'sequential-workflow-model';
import { ActivityStateInitializer } from '../../types';
import { BranchNameResult, InterruptResult, SkipResult } from '../results';

export type ParallelActivityHandlerResult = InterruptResult | BranchNameResult[] | SkipResult;
export type ParallelActivityHandler<TStep extends BranchedStep, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<ParallelActivityHandlerResult>;

export interface ParallelActivityState<TActivityState> {
	activityState: TActivityState;
	branchNames?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParallelActivityConfig<TStep extends BranchedStep, TGlobalState, TActivityState extends object> {
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	handler: ParallelActivityHandler<TStep, TGlobalState, TActivityState>;
}
