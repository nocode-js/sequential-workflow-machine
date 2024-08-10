import { Step } from 'sequential-workflow-model';
import { ActivityStateInitializer, SignalPayload } from '../../types';
import { InterruptResult } from '../results';

export type BeforeSignalActivityHandler<TStep extends Step, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState
) => Promise<SignalActivityHandlerResult>;

export type AfterSignalActivityHandler<TStep extends Step, GlobalState, ActivityState> = (
	step: TStep,
	globalState: GlobalState,
	activityState: ActivityState,
	signalPayload: SignalPayload
) => Promise<SignalActivityHandlerResult>;

export type SignalActivityHandlerResult = void | InterruptResult;

export interface SignalActivityConfig<TStep extends Step, GlobalState, ActivityState extends object> {
	init: ActivityStateInitializer<TStep, GlobalState, ActivityState>;
	beforeSignal: BeforeSignalActivityHandler<TStep, GlobalState, ActivityState>;
	afterSignal: AfterSignalActivityHandler<TStep, GlobalState, ActivityState>;
}
