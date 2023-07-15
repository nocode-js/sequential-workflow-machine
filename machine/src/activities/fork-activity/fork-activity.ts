import { Activity } from '../../types';
import { ForkActivityNodeBuilder } from './fork-activity-node-builder';
import { ForkActivityConfig } from './types';
import { BranchedStep } from 'sequential-workflow-model';

export function createForkActivity<TStep extends BranchedStep, TGlobalState = object, TActivityState extends object = object>(
	stepType: TStep['type'],
	config: ForkActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ForkActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
