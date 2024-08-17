import { Definition } from 'sequential-workflow-model';
import { interpret, State } from 'xstate';
import { GlobalStateInitializer, MachineContext, SequentialStateMachine, SerializedWorkflowMachineSnapshot } from './types';
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
		return new WorkflowMachineInterpreter(interpret(machine), undefined);
	}

	public deserializeSnapshot(
		serializedSnapshot: SerializedWorkflowMachineSnapshot<GlobalState>
	): WorkflowMachineInterpreter<GlobalState> {
		const initState = this.machine.resolveState(State.create(serializedSnapshot));
		return new WorkflowMachineInterpreter(interpret(this.machine), initState as unknown as State<MachineContext<GlobalState>>);
	}

	public getNative(): SequentialStateMachine<GlobalState> {
		return this.machine;
	}
}
