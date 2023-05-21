import { Activity } from '../../types';
import { InterruptionActivityConfig } from './types';
import { Step } from 'sequential-workflow-model';
import { InterruptionActivityNodeBuilder } from './interruption-activity-node-builder';

export function createInterruptionActivity<TStep extends Step = Step, TGlobalState = object>(
	config: InterruptionActivityConfig<TStep, TGlobalState>
): Activity<TGlobalState> {
	return {
		stepType: config.stepType,
		nodeBuilderFactory: () => new InterruptionActivityNodeBuilder(config)
	};
}
