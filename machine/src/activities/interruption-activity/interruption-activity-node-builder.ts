import { ActivityNodeBuilder, MachineContext, ActivityNodeConfig, STATE_FAILED_TARGET, STATE_INTERRUPTED_TARGET } from '../../types';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { getStepNodeId } from '../../core/safe-node-id';
import { Step } from 'sequential-workflow-model';
import { InterruptionActivityConfig } from './types';

export class InterruptionActivityNodeBuilder<TStep extends Step, TGlobalState> implements ActivityNodeBuilder<TGlobalState> {
	public constructor(private readonly config: InterruptionActivityConfig<TStep, TGlobalState>) {}

	public build(step: TStep): ActivityNodeConfig<TGlobalState> {
		const nodeId = getStepNodeId(step.id);
		return {
			id: nodeId,
			invoke: {
				src: catchUnhandledError((context: MachineContext<TGlobalState>) => this.config.handler(step, context.globalState)),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET
					}
				],
				onError: STATE_FAILED_TARGET
			}
		};
	}
}
