import { StateValue } from 'xstate';
import { MachineUnhandledError } from './machine-unhandled-error';
import { readStatePath } from './core/state-path-reader';
import { STATE_FAILED_ID, STATE_FINISHED_ID, STATE_INTERRUPTED_ID } from './types';
import { STATE_STEP_ID_PREFIX } from './core';

export class WorkflowMachineSnapshot<GlobalState> {
	private statePath?: string[];

	public constructor(
		public readonly globalState: GlobalState,
		public readonly unhandledError: MachineUnhandledError | undefined,
		private readonly stateValue: StateValue
	) {}

	public getStatePath(): string[] {
		if (!this.statePath) {
			this.statePath = readStatePath(this.stateValue);
		}
		return this.statePath;
	}

	public tryGetCurrentStepId(): string | null {
		const path = this.getStatePath();
		for (let i = path.length - 1; i >= 0; i--) {
			const item = path[i];
			if (item.startsWith(STATE_STEP_ID_PREFIX)) {
				return item.substring(STATE_STEP_ID_PREFIX.length);
			}
		}
		return null;
	}

	public isFinished(): boolean {
		return this.getStatePath()[0] === STATE_FINISHED_ID;
	}

	public isFailed(): boolean {
		return this.getStatePath()[0] === STATE_FAILED_ID;
	}

	public isInterrupted(): boolean {
		return this.getStatePath()[0] === STATE_INTERRUPTED_ID;
	}
}
