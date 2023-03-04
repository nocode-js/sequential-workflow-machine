import { Activity } from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { SequentialStep } from 'sequential-workflow-model';
import { ContainerActivityConfig } from './types';
import { ContainerActivityNodeBuilder } from './container-activity-node-builder';

export function createContainerActivity<TStep extends SequentialStep = SequentialStep, GlobalState = object, ActivityState = object>(
	config: ContainerActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	const activityStateAccessor = new ActivityStateAccessor(config.init);

	return {
		stepType: config.stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ContainerActivityNodeBuilder(sequenceNodeBuilder, activityStateAccessor, config)
	};
}
