import { Activity } from '../../types';
import { SequentialStep } from 'sequential-workflow-model';
import { ContainerActivityConfig } from './types';
import { ContainerActivityNodeBuilder } from './container-activity-node-builder';

export function createContainerActivity<
	TStep extends SequentialStep = SequentialStep,
	TGlobalState = object,
	TActivityState extends object = object
>(stepType: TStep['type'], config: ContainerActivityConfig<TStep, TGlobalState, TActivityState>): Activity<TGlobalState> {
	return {
		stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ContainerActivityNodeBuilder(sequenceNodeBuilder, config)
	};
}
