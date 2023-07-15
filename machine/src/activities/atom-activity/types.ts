import { Step } from 'sequential-workflow-model';
import { ActivityStateInitializer } from '../../types';
import { InterruptResult } from '../results/interrupt-result';

export type AtomActivityHandler<TStep extends Step, TGlobalState, TActivityState> = (
	step: TStep,
	globalState: TGlobalState,
	activityState: TActivityState
) => Promise<AtomActivityHandlerResult>;

export type AtomActivityHandlerResult = void | InterruptResult;

export interface AtomActivityConfig<TStep extends Step, TGlobalState, TActivityState extends object> {
	init: ActivityStateInitializer<TStep, TGlobalState, TActivityState>;
	handler: AtomActivityHandler<TStep, TGlobalState, TActivityState>;
}
