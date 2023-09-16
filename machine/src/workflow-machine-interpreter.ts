import { SequentialStateMachineInterpreter } from './types';
import { WorkflowMachineSnapshot } from './workflow-machine-snapshot';

export class WorkflowMachineInterpreter<GlobalState> {
	public constructor(private readonly interpreter: SequentialStateMachineInterpreter<GlobalState>) {}

	public start(): this {
		this.interpreter.start();
		return this;
	}

	public getSnapshot(): WorkflowMachineSnapshot<GlobalState> {
		const snapshot = this.interpreter.getSnapshot();
		return new WorkflowMachineSnapshot(snapshot.context.globalState, snapshot.context.unhandledError, snapshot.value);
	}

	public onDone(callback: () => void): this {
		this.interpreter.onDone(callback);
		return this;
	}

	public onChange(callback: () => void): this {
		this.interpreter.onChange(callback);
		return this;
	}

	public sendSignal(signalName: string, params?: Record<string, unknown>): this {
		this.interpreter.send(signalName, params);
		return this;
	}

	public getNative(): SequentialStateMachineInterpreter<GlobalState> {
		return this.interpreter;
	}
}
