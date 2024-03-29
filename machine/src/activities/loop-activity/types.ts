import { SequentialStep } from 'sequential-workflow-model';
import { ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results';

export type LoopActivityHandlerResult = boolean | InterruptResult;
export type LoopActivityEventHandler<TStep extends SequentialStep, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<void> | void;
export type LoopActivityConditionHandler<TStep extends SequentialStep, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<LoopActivityHandlerResult>;

export interface LoopActivityConfig<TStep extends SequentialStep, TGlobalState, TActivityState extends object> {
	loopName: (step: TStep) => string;
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	condition: LoopActivityConditionHandler<TStep, TGlobalState, TActivityState>;
	onEnter?: LoopActivityEventHandler<TStep, TGlobalState, TActivityState>;
	onLeave?: LoopActivityEventHandler<TStep, TGlobalState, TActivityState>;
}

export interface LoopActivityState<TActivityState> {
	continue?: boolean;
	activityState: TActivityState;
}
