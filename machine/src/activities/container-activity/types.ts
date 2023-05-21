import { Step } from 'sequential-workflow-model';
import { ActivityConfig, ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';

export type ContainerActivityHandler<TStep extends Step, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<ContainerActivityHandlerResult>;

export type ContainerActivityHandlerResult = void | InterruptResult;

export interface ContainerActivityConfig<TStep extends Step, TGlobalState, TActivityState> extends ActivityConfig<TStep> {
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	onEnter?: ContainerActivityHandler<TStep, TGlobalState, TActivityState>;
	onLeave?: ContainerActivityHandler<TStep, TGlobalState, TActivityState>;
}
