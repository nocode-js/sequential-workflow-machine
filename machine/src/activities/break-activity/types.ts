import { Step } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results';
import { BreakResult } from './break-result';

export type BreakActivityHandler<TStep extends Step, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<BreakActivityHandlerResult>;

export type BreakActivityHandlerResult = void | InterruptResult | BreakResult;

export interface BreakActivityConfig<TStep extends Step, TGlobalState, TActivityState> extends ActivityConfig<TStep> {
	loopName: (step: TStep) => string;
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	handler: BreakActivityHandler<TStep, TGlobalState, TActivityState>;
}

export interface BreakActivityState<TActivityState> {
	break?: boolean;
	activityState: TActivityState;
}
