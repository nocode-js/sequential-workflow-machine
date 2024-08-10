import { Activity, SignalPayload } from '../../types';
import { WorkflowMachineInterpreter } from '../../workflow-machine-interpreter';
import { SignalActivityNodeBuilder } from './signal-activity-node-builder';
import { SignalActivityConfig } from './types';
import { Step } from 'sequential-workflow-model';

export function createSignalActivity<TStep extends Step, GlobalState = object, TActivityState extends object = object>(
	stepType: TStep['type'],
	config: SignalActivityConfig<TStep, GlobalState, TActivityState>
): Activity<GlobalState> {
	return {
		stepType,
		nodeBuilderFactory: () => new SignalActivityNodeBuilder(config)
	};
}

export function signalSignalActivity<GlobalState, P extends SignalPayload>(
	interpreter: WorkflowMachineInterpreter<GlobalState>,
	payload: P
) {
	interpreter.sendSignal('SIGNAL_RECEIVED', payload);
}
