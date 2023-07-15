import { Activity } from '../../types';
import { InterruptionActivityConfig } from './types';
import { Step } from 'sequential-workflow-model';
import { InterruptionActivityNodeBuilder } from './interruption-activity-node-builder';

export function createInterruptionActivity<TStep extends Step = Step, TGlobalState = object>(
	stepType: TStep['type'],
	config: InterruptionActivityConfig<TStep, TGlobalState>
): Activity<TGlobalState> {
	return {
		stepType,
		nodeBuilderFactory: () => new InterruptionActivityNodeBuilder(config)
	};
}
