import { createMachine } from 'xstate';
import { Definition } from 'sequential-workflow-model';
import { BuildingContext, MachineContext, STATE_FAILED_ID, STATE_FINISHED_ID, STATE_FINISHED_TARGET, STATE_INTERRUPTED_ID } from './types';
import { SequenceNodeBuilder } from './core/sequence-node-builder';
import { ActivitySet } from './core/activity-set';
import { WorkflowMachine } from './workflow-machine';
import { getStepNodeId } from './core';

export interface BuildConfig {
	initialStepId?: string;
}

export class WorkflowMachineBuilder<GlobalState> {
	public constructor(private readonly sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>) {}

	public build(definition: Definition, config?: BuildConfig): WorkflowMachine<GlobalState> {
		const buildingContext: BuildingContext = {};

		const initial = config?.initialStepId ? getStepNodeId(config.initialStepId) : 'MAIN';
		const machine = createMachine<MachineContext<GlobalState>>({
			initial,
			predictableActionArguments: true,
			states: {
				MAIN: this.sequenceNodeBuilder.build(buildingContext, definition.sequence, STATE_FINISHED_TARGET),
				FINISHED: {
					id: STATE_FINISHED_ID,
					type: 'final'
				},
				INTERRUPTED: {
					id: STATE_INTERRUPTED_ID,
					type: 'final'
				},
				FAILED: {
					id: STATE_FAILED_ID,
					type: 'final'
				}
			}
		});

		return new WorkflowMachine(definition, machine);
	}
}

export function createWorkflowMachineBuilder<GlobalState>(activitySet: ActivitySet<GlobalState>): WorkflowMachineBuilder<GlobalState> {
	return new WorkflowMachineBuilder(new SequenceNodeBuilder(activitySet));
}
