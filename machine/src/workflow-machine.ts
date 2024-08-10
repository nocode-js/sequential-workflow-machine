import { Definition } from 'sequential-workflow-model';
import { interpret } from 'xstate';
import { GlobalStateInitializer, MachineContext, SequentialStateMachine } from './types';
import { WorkflowMachineInterpreter } from './workflow-machine-interpreter';

export interface StartConfig<GlobalState> {
	init: GlobalStateInitializer<GlobalState>;
}

export class WorkflowMachine<GlobalState> {
	public constructor(
		private readonly definition: Definition,
		private readonly machine: SequentialStateMachine<GlobalState>
	) {}

	public create(config: StartConfig<GlobalState>): WorkflowMachineInterpreter<GlobalState> {
		return this.restore({
			globalState: config.init(this.definition),
			activityStates: {}
		});
	}

	public restore(context: MachineContext<GlobalState>): WorkflowMachineInterpreter<GlobalState> {
		const machine = this.machine.withContext(context);
		return new WorkflowMachineInterpreter(interpret(machine));
	}

	public getNative(): SequentialStateMachine<GlobalState> {
		return this.machine;
	}
}
