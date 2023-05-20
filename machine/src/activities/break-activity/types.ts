import { Step } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results';
import { BreakResult } from './break-result';

export type BreakActivityHandler<TStep extends Step, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<BreakActivityHandlerResult>;

export type BreakActivityHandlerResult = void | InterruptResult | BreakResult;

export interface BreakActivityConfig<TStep extends Step, GlobalState, ActivityState> extends ActivityConfig<TStep> {
	loopName: (step: TStep) => string;
	init: ActivityStateInitializer<GlobalState, ActivityState>;
	handler: BreakActivityHandler<TStep, GlobalState, ActivityState>;
}

export interface BreakActivityState<ActivityState> {
	break?: boolean;
	activityState: ActivityState;
}
