## 0.3.1

This version adds a new feature to the `break` activity. Now it is possible to break a parent loop without specifying the name of the loop. The previous approach is still supported.

```ts
createBreakActivity<BreakStep>('break', {
  loopName: (step) => -1,
  // ...
});
```

## 0.3.0

This version changes the syntax of all `create*Activity` functions. The first argument is the step type, the second argument is the configuration.

```ts
// Old syntax
const fooActivity = createAtomActivity<FooStep, MyGlobalState, FooStateState>({
  stepType: 'foo',
  init: /* ... */,
  handler: /* ... */,
})

// New syntax
const fooActivity = createAtomActivity<FooStep, MyGlobalState, FooStateState>('foo', {
  init: /* ... */,
  handler: /* ... */,
})
```

Additionally this version introduces the `createAtomActivityFromHandler` function. It allows to create an activity by very short syntax. This function creates an activity without the activity state.

```ts
const fooActivity = createAtomActivityFromHandler<FooStep, MyGlobalState>('foo', async (step, globalState) => {
  // handler
});
```

## 0.2.0

**Breaking Changes**

The activity state initializer has one new argument. The order of arguments is not backward compatible. The first argument is a step, the second argument is a global state.

## 0.1.3

Added two new activities: `LoopActivity` and `BreakActivity`.

## 0.1.2

Changed bundle format of the `sequential-workflow-machine` package to: UMD, ESM and CommonJS.

## 0.1.1

First release! 🎉
