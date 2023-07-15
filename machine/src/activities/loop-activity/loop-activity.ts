import { Activity } from '../../types';
import { LoopActivityNodeBuilder } from './loop-activity-node-builder';
import { LoopActivityConfig } from './types';
import { SequentialStep } from 'sequential-workflow-model';

export function createLoopActivity<TStep extends SequentialStep, TGlobalState = object, TActivityState extends object = object>(
	stepType: TStep['type'],
	config: LoopActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new LoopActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
