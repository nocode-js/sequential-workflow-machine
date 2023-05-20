import { SequentialStep } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results';

export type LoopActivityHandlerResult = boolean | InterruptResult;
export type LoopActivityEventHandler<TStep extends SequentialStep, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => void;
export type LoopActivityConditionHandler<TStep extends SequentialStep, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<LoopActivityHandlerResult>;

export interface LoopActivityConfig<TStep extends SequentialStep, GlobalState, ActivityState> extends ActivityConfig<TStep> {
	loopName: (step: TStep) => string;
	init: ActivityStateInitializer<GlobalState, ActivityState>;
	condition: LoopActivityConditionHandler<TStep, GlobalState, ActivityState>;
	onEnter?: LoopActivityEventHandler<TStep, GlobalState, ActivityState>;
	onLeave?: LoopActivityEventHandler<TStep, GlobalState, ActivityState>;
}

export interface LoopActivityState<ActivityState> {
	continue?: boolean;
	activityState: ActivityState;
}
