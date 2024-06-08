import { Activity } from '../../types';
import { ParallelActivityNodeBuilder } from './parallel-activity-node-builder';
import { ParallelActivityConfig } from './types';
import { BranchedStep } from 'sequential-workflow-model';

export function createParallelActivity<TStep extends BranchedStep, TGlobalState = object, TActivityState extends object = object>(
	stepType: TStep['type'],
	config: ParallelActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ParallelActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
