import { setup, createActor, assign, assertEvent } from 'xstate';
// import { createResourceMachine } from '@/lib/ResourceMachine';

// const resourceMachine = createResourceMachine<Source>()
// type ResourceActor = typeof resourceMachine

type MachineContext = {
  dump?: string;
  selectedProjectIds: string[]
  // sourceActor: ActorRefFrom<ResourceActor>;
};

export type MachineEvent =
  | { type: 'GO_PROJECTS'; }
  | { type: 'GO_PERIODIC_PROJECTS'; }
  | { type: 'GO_EXPLORER'; }
  | { type: 'GO_GPT'; }
  | { type: 'SELECT_PROJECTS_MODE'; }
  | { type: 'SELECT_PROJECT'; projectId: string; }
  | { type: 'IDLE_PROJECTS_MODE'; }
  | { type: 'CLEAR_SELECTED_PROJECT_IDS'; }

export const createAppMachine = setup({
  types: {
    context: {} as MachineContext,
    events: {} as MachineEvent,
  },
  actions: {
    assignSelectedProjectIds: assign({
      selectedProjectIds: ({ event }) => {
        assertEvent(event, ['SELECT_PROJECTS_MODE']);
        return [];
      },
    }),
    assignSelectedProjectId: assign({
      selectedProjectIds: ({ context: ctx, event }) => {
        assertEvent(event, ['SELECT_PROJECT']);
        const newSelected = new Set(ctx.selectedProjectIds);
        if (newSelected.has(event.projectId)) {
          newSelected.delete(event.projectId);
        } else {
          newSelected.add(event.projectId);
        }
        return [...newSelected];
      },
    }),
    clearSelectedProjectIds: assign({
      selectedProjectIds: () => [],
    }),
    // spawnActors: assign({
    //   sourceActor: ({ spawn }) => spawn<ResourceActor>(resourceMachine, { input: { collection: 'sources' } })
    // }),
    // loadActors: ({ context }) => {
    //   context.sourceActor.send({ type: 'FETCH' });
    // },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBxA8gfQAUAlHAKQFEBhAFQGUBtABgF1FRUB7WASwBduOAOzYgAHogCMAFgDMAOhmMATIwCcjAOyqNE1QA4NAGhABPRFMZy9S1RIBsdiTLvbFEgKwBfT8bSZchOREAJI4ACLBlIQkFDQMLCKcPPxCIuIIMhJKckru7hoyGowGqqpSRqbmlta2Dk4uBYwS3r7o2PjkABoEADI4REFMrEggSXwCwiPp7jLZEhoajiolZRVmCBZWNvaOzq5NLSB+7XhYBNRDiVzjqVOILqpyjFLlpe4r5cbrmzU79fvNHxHdByVAAJw4ACswABjXiwAjIGBybgQAA2YAwtHIPSo1GiZDxtDwAFlwuRLiMxilJqB0gBaNxWGQvCT1JTzRh2L6IFTuORaLTLTL6dzPQ5+UEQ6FwhFIsByWBgDFwjDBMK4gmxOik8mU9jXGlpRD0pR6R56RiZKR6OzmiTPWQ8jLKOQeKTzJQaaxKZYSkHgqGw+GI5FKlW8LE4vFavH60aGibGhDuOxWCx2Ga5WRSdxlZ2zflld4chZ6az5f2oKVB2WhhXh4MYSi4gCCRDw2NxNHIYVjNDw6viwwNySTdwQHie1hnNlUdikdiFzr5Au05q9XtzhVU3iBgg4EDgIj8VzHtzpJtkGjkNtU7ztShe8+d9MXciXxRmuikqhkFarGsZRDeUzxuWkxBNf9HjvB9rGfblKknCQ9BydcChke93CkbNAMDYC5WRVEMTAo0J0ZD1b3NOCn1-RDviUNMWVKW13HZcUgUlfDg0IhtlWDUjx0vBB6XvAVnGfX8vT-DQlGdHCmLFZQzXsawZBkLxOIDMAwQECBuBhAhpR4+tBIvSCMhsBRZNUJ93i0VZnTZeRfjqPYCkAsBRFQNEODBHTTKpRNzOmTDrJsOyPjWSQnC2WpdgaGRAKgVBeEC0dwOTFxUMKCLcyipzYtchLXD3TwgA */
  id: 'app',

  initial: "projectsPage",

  context: {
    selectedProjectIds: [],
    // sourceActor: {} as ActorRefFrom<ResourceActor>,
  },

  states: {
    projectsPage: {
      states: {
        idle: {
          on: {
            SELECT_PROJECTS_MODE: {
              target: "select",
              actions: "assignSelectedProjectIds"
            }
          }
        },
        select: {
          on: {
            IDLE_PROJECTS_MODE: {
              target: "idle",
              actions: "clearSelectedProjectIds"
            },

            SELECT_PROJECT: {
              target: "select",
              actions: "assignSelectedProjectId"
            },

            CLEAR_SELECTED_PROJECT_IDS: {
              target: "select",
              actions: "clearSelectedProjectIds"
            }
          }
        }
      },

      initial: "idle"
    },
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