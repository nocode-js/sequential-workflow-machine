import { Step } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';

export type ContainerActivityHandler<TStep extends Step, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<ContainerActivityHandlerResult>;

export type ContainerActivityHandlerResult = void | InterruptResult;

export interface ContainerActivityConfig<TStep extends Step, GlobalState, ActivityState> extends ActivityConfig<TStep> {
	init: ActivityStateInitializer<GlobalState, ActivityState>;
	onEnter?: ContainerActivityHandler<TStep, GlobalState, ActivityState>;
	onLeave?: ContainerActivityHandler<TStep, GlobalState, ActivityState>;
}
