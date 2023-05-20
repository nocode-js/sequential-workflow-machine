import { BuildingContext } from '../types';

export interface LoopStackItem {
	name: string;
	leaveNodeTarget: string;
}

const stackKey = 'loopStack';

export function getLoopStack(buildingContext: BuildingContext): LoopStack {
	let stack = buildingContext[stackKey] as LoopStack | undefined;
	if (!stack) {
		stack = new LoopStack();
		buildingContext[stackKey] = stack;
	}
	return stack;
}

export class LoopStack {
	private readonly stack: LoopStackItem[] = [];

	public push(name: string, leaveNodeTarget: string) {
		if (this.stack.some(item => item.name === name)) {
			throw new Error(`Loop with name "${name}" is already used in the stack`);
		}

		this.stack.push({
			name,
			leaveNodeTarget
		});
	}

	public pop() {
		this.stack.pop();
	}

	public getNodeTarget(name: string): string {
		const item = this.stack.find(item => item.name === name);
		if (!item) {
			throw new Error(`Loop with name "${name}" not found`);
		}
		return item.leaveNodeTarget;
	}
}
