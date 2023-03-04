# Sequential Workflow Machine

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fb4rtaz%2Fsequential-workflow-engine%2Fbadge%3Fref%3Dmain&style=flat-square)](https://actions-badge.atrox.dev/b4rtaz/sequential-workflow-engine/goto?ref=main) [![License: MIT](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](/LICENSE) [![View this project on NPM](https://img.shields.io/npm/v/sequential-workflow-engine.svg?style=flat-square)](https://npmjs.org/package/sequential-workflow-engine)

The powerful sequential workflow machine for frontend and backend applications. It provides a simple API for creating own step execution handlers (activities). It supports multiple types of activities. Internally is uses the [xstate](https://github.com/statelyai/xstate) library.

This engine uses the same data model as the [Sequential Workflow Designer](https://github.com/nocode-js/sequential-workflow-designer). So you can create a workflow definition in the designer and then run it by this engine easily.

📝 Check the [documentation](https://nocode-js.com/docs/category/sequential-workflow-machine) for more details.

## 🚀 Installation

Install the following packages by NPM command:

```
npm i sequential-workflow-model sequential-workflow-machine
```

## 🎬 Usage

You can use the engine in a JavaScript or TypeScript application. We recommend to use TypeScript because a workflow uses a lot of data structures and it's hard to maintain data integrity.

At the beginning you need to define the type of your workflow definition.

```ts
import { Definition } from 'sequential-workflow-model';

interface MyDefinition extends Definition {
  properties: {
    verbose: boolean;
  };
}
```

Next, define your step types.

```ts
import { Step } from 'sequential-workflow-model';

interface DownloadHtmlStep extends Step {
  componentType: 'task';
  type: 'downloadHtml';
  properties: {
    pageUrl: string;
  };
}

// ...
```

Prepare the workflow definition.

```ts
const definition: MyDefinition = {
  properties: {
    verbose: true,
  },
  sequence: [
    {
      id: '0x00001',
      componentType: 'task',
      type: 'downloadHtml',
      name: 'Download google.com',
      properties: {
        pageUrl: 'https://www.google.com',
      },
    },
  ],
};
```

Prepare the global state interface.

```ts
interface WorkflowGlobalState {
  html: string | null;
}
```

Prepare activities for your steps. The engine supports multiple types of activities. The basic activity is the atom activity. It's a simple handler that executes an atomic step and updates the global state.

```ts
import { createAtomActivity } from 'sequential-workflow-machine';

interface DownloadHtmlStepState {
  attempt: number;
}

const downloadHtmlActivity = createAtomActivity<DownloadHtmlStep, WorkflowGlobalState, DownloadHtmlStepState>({
  stepType: 'downloadHtml',
  init: () => ({
    attempt: 0,
  }),
  handler: async (step: DownloadHtmlStep, globalState: WorkflowGlobalState, activityState: DownloadHtmlStepState) => {
    globalState.html = await downloadHtml(step.properties.pageUrl);
    activityState.attempt++;
  },
});
```

Now we can create the activity set. The activity set is a collection of all supported activities.

```ts
import { activitySet } from 'sequential-workflow-machine';

const activitySet =  createActivitySet<WorkflowGlobalState>([
  downloadHtmlActivity,
]);
```

Finally, we can create the workflow machine and run it.

```ts
import { createWorkflowMachineBuilder } from 'sequential-workflow-machine';

const builder = createWorkflowMachineBuilder<WorkflowGlobalState>(activitySet);
const machine = builder.build(definition);
const interpreter = machine.create({
  init: () => {
    return {
      html: null,
    };
  }
});
interpreter.onChange(() => { /* ... */ });
interpreter.onDone(() => { /* ... */ });
interpreter.start();
```

That's it!

## 💡 License

This project is released under the MIT license.
