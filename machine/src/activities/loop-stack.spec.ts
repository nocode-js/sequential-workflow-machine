import { LoopStack } from './loop-stack';

describe('LoopStack', () => {
	describe('when stack contains 3 loops', () => {
		let stack: LoopStack;

		beforeEach(() => {
			stack = new LoopStack();
			stack.push('loop1', 'leave1');
			stack.push('loop2', 'leave2');
			stack.push('loop3', 'leave3');
		});

		it('returns proper target when argument is name', () => {
			expect(stack.getNodeTarget('loop1')).toBe('leave1');
			expect(stack.getNodeTarget('loop2')).toBe('leave2');
			expect(stack.getNodeTarget('loop3')).toBe('leave3');
		});

		it('returns proper target when argument is name', () => {
			expect(stack.getNodeTarget(-1)).toBe('leave3');
		});

		it('throws error when index is 0', () => {
			expect(() => stack.getNodeTarget(0 as unknown as -1)).toThrowError('Index 0 is not supported');
		});

		it('throws error when index is 1', () => {
			expect(() => stack.getNodeTarget(1 as unknown as -1)).toThrowError('Index 1 is not supported');
		});

		it('throws error when name is not found', () => {
			expect(() => stack.getNodeTarget('foo')).toThrowError('Loop "foo" not found');
		});
	});

	describe('when stack is empty', () => {
		it('throws error when index is -1', () => {
			const stack = new LoopStack();
			expect(() => stack.getNodeTarget(-1)).toThrowError('Cannot find any parent loop');
		});
	});
});
