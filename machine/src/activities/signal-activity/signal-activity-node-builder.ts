import { SignalActivityConfig } from './types';
import { EventObject } from 'xstate';
import { Step } from 'sequential-workflow-model';
import { ActivityStateProvider, catchUnhandledError, getStepNodeId } from '../../core';
import {
	ActivityNodeBuilder,
	ActivityNodeConfig,
	MachineContext,
	SignalPayload,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { isInterruptResult } from '../results';

export class SignalActivityNodeBuilder<TStep extends Step, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(private readonly config: SignalActivityConfig<TStep, TGlobalState, TActivityState>) {}

	public build(step: TStep, nextNodeTarget: string): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider(step, this.config.init);
		const nodeId = getStepNodeId(step.id);

		return {
			id: nodeId,
			initial: 'BEFORE_SIGNAL',
			states: {
				BEFORE_SIGNAL: {
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
							const activityState = activityStateProvider.get(context, nodeId);

							const result = await this.config.beforeSignal(step, context.globalState, activityState);
							if (isInterruptResult(result)) {
								context.interrupted = nodeId;
								return;
							}
						}),
						onDone: [
							{
								target: STATE_INTERRUPTED_TARGET,
								cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
							},
							{
								target: 'WAIT_FOR_SIGNAL'
							}
						],
						onError: STATE_FAILED_TARGET
					}
				},
				WAIT_FOR_SIGNAL: {
					on: {
						SIGNAL_RECEIVED: {
							target: 'AFTER_SIGNAL'
						}
					}
				},
				AFTER_SIGNAL: {
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>, event: EventObject) => {
							const activityState = activityStateProvider.get(context, nodeId);
							const ev = event as { type: string; payload: SignalPayload };

							const result = await this.config.afterSignal(step, context.globalState, activityState, ev.payload);
							if (isInterruptResult(result)) {
								context.interrupted = nodeId;
								return;
							}
						}),
						onDone: [
							{
								target: STATE_INTERRUPTED_TARGET,
								cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
							},
							{
								target: nextNodeTarget
							}
						],
						onError: STATE_FAILED_TARGET
					}
				}
			}
		};
	}
}
