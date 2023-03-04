import { Step } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';

export type AtomActivityHandler<TStep extends Step, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<AtomActivityHandlerResult>;

export type AtomActivityHandlerResult = void | InterruptResult;

export interface AtomActivityConfig<TStep extends Step, GlobalState, ActivityState> extends ActivityConfig<TStep> {
	init: ActivityStateInitializer<GlobalState, ActivityState>;
	handler: AtomActivityHandler<TStep, GlobalState, ActivityState>;
}
