// import { createResourceMachine } from '@/lib/ResourceMachine';
import { setup, createActor } from 'xstate';

// const resourceMachine = createResourceMachine<Source>()
// type ResourceActor = typeof resourceMachine

type MachineContext = {
  dump?: string;
  // sourceActor: ActorRefFrom<ResourceActor>;
};

export type MachineEvent =
  | { type: 'GO_PROJECTS'; }
  | { type: 'GO_PERIODIC_PROJECTS'; }
  | { type: 'GO_EXPLORER'; }
  | { type: 'GO_GPT'; }

export const createAppMachine = setup({
  types: {
    context: {} as MachineContext,
    events: {} as MachineEvent,
  },
  actions: {
    // spawnActors: assign({
    //   sourceActor: ({ spawn }) => spawn<ResourceActor>(resourceMachine, { input: { collection: 'sources' } })
    // }),
    // loadActors: ({ context }) => {
    //   context.sourceActor.send({ type: 'FETCH' });
    // },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBxA8gfQAUAlHAKQFEBhAFQGUBtABgF1FRUB7WASwBduOAOzYgAHogC0AJikBWAHQAWAGwAOAOyyANCACeiZeoC+RnWky5C5IgEkcAERuVCJCjQYsRnHvyEjxCBLqAJzyAIxh6mEa2noGxqYg5tj45AAaBAAyOETWTKxIIN58AsKFAWGKjPKqjCoxOvoIhiZm6Cl4WATU+V5cJX7liADMjOryhtGajfEmiYIcEHAi5n0+pf6SUurDSmrTcYFS1bKtSejyqABOHABWYADGvLAEyDBrA2WgAdKRMwiVRhncyXMBXAQQbgPAg3e5PF5vMAfXxfMSSZRSf6A4EXMCiVAAGw4VzBr3ehWKKM2AMUqixVRxqHkUFQvDJSIp-SpQwQo3U9KBcyAA */
  id: 'app',

  initial: "projectsPage",

  context: {
    // sourceActor: {} as ActorRefFrom<ResourceActor>,
  },

  states: {
    projectsPage: {},
    periodicProjectsPage: {},
    explorerPage: {},
    gptPage: {}
  },

  on: {
    GO_PROJECTS: ".projectsPage",
    GO_PERIODIC_PROJECTS: ".periodicProjectsPage",
    GO_EXPLORER: ".explorerPage",
    GO_GPT: ".gptPage"
  }
})


export const AppActor = createActor(createAppMachine);
AppActor.start();