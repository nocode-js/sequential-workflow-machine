import { InterpreterStatus, State } from 'xstate';
import { MachineContext, SequentialStateMachineInterpreter, SerializedWorkflowMachineSnapshot, SignalPayload } from './types';
import { WorkflowMachineSnapshot } from './workflow-machine-snapshot';

export class WorkflowMachineInterpreter<GlobalState> {
	public constructor(
		private readonly interpreter: SequentialStateMachineInterpreter<GlobalState>,
		private readonly initState: State<MachineContext<GlobalState>> | undefined
	) {}

	public start(): this {
		this.interpreter.start(this.initState);
		return this;
	}

	public getSnapshot(): WorkflowMachineSnapshot<GlobalState> {
		const snapshot = this.interpreter.getSnapshot();
		return new WorkflowMachineSnapshot(snapshot.context.globalState, snapshot.context.unhandledError, snapshot.value);
	}

	public serializeSnapshot(): SerializedWorkflowMachineSnapshot<GlobalState> {
		return this.interpreter.getSnapshot().toJSON() as unknown as SerializedWorkflowMachineSnapshot<GlobalState>;
	}

	public onDone(callback: () => void): this {
		this.interpreter.onStop(callback);
		return this;
	}

	public onChange(callback: () => void): this {
		this.interpreter.onChange(callback);
		return this;
	}

	public isRunning(): boolean {
		return this.interpreter.status === InterpreterStatus.Running;
	}

	public tryStop(): boolean {
		if (this.isRunning()) {
			this.interpreter.stop();
			return true;
		}
		return false;
	}

	public sendSignal<P extends SignalPayload>(event: string, payload: P): this {
		this.interpreter.send(event, {
			payload
		});
		return this;
	}

	public getNative(): SequentialStateMachineInterpreter<GlobalState> {
		return this.interpreter;
	}
}
