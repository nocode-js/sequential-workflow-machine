import { Activity } from '../../types';
import { ForkActivityNodeBuilder } from './fork-activity-node-builder';
import { ForkActivityConfig } from './types';
import { BranchedStep } from 'sequential-workflow-model';

export function createForkActivity<TStep extends BranchedStep, TGlobalState = object, TActivityState = object>(
	config: ForkActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType: config.stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ForkActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
