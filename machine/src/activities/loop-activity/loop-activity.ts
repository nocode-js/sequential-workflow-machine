import { Activity } from '../../types';
import { LoopActivityNodeBuilder } from './loop-activity-node-builder';
import { LoopActivityConfig } from './types';
import { SequentialStep } from 'sequential-workflow-model';

export function createLoopActivity<TStep extends SequentialStep, TGlobalState = object, TActivityState = object>(
	config: LoopActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType: config.stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new LoopActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
