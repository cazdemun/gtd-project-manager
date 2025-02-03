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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBxA8gfQAUAlHAKQFEBhAFQGUBtABgF1FRUB7WASwBduOAOzYgAHogC0AVgAsARgB0AThUAOWQDYA7ACZGGjTIA0IAJ6IZjBap1K5BuQGYNSrY8ZyAvp5NpMuQnIiAEkcABFgykISChoGFhFOHn4hEXEEHTkrDXUZRy0NWRk9HWMzCysbOwdnV3cvHxA-bHxyAA0CABkcIiCmViQQJL4BYUH0jUYZBW0CuT1VLRUZLRNzBEtrW3sNJxc3D29fdBa8LAJqfsSuEdTxxC0tRSKlpSlF5dXyjcrtmv36kcmugFKgAE4cABWYAAxrxYARkDAFNwIAAbMAYWjkTpUajRMh42h4ACy4XIV0GwxSY1A6Wk6gUOkKUiyNikOikSjWiEyqmUNg0nMYWneqkYUikQL8oIh0LhCKRYAUsDAGLhGGCYVxBNidFJ5Mp7BuNLSkikbiZjmKMlUcg5ciUOlUPIQjntCkcjlUiy0jGZcns1ulIPBUNh8MRyNV6t4WJxeN1eKNQxNozNCAkOmZCi5Uye70e6gMrvdOgUWU5OkcUnyUkm2hDqFl4YVUeVMYjGEouIAgkQ8NjcTRyGEkzQ8Fr4gNjcl0-dM8z+dabE8gzJ5FJXXyBZylPsnDIlI4m6CwGCBBBuDCCHKI4ro2qu1qdcRCXEDWEKQkqWm7nTeTkLRrF0Y8lFUGRtFUfIvnWd0pE9b0fSArRV0gmRT1Qc9L2vW9W0jJUUXRTEh0TN89WJMkvxTal5wAjIJWseQcnAyDUJg7c5H5cCAxFWRJSrTDsI4K8bzvNtCM7DVSIncjkx-WdblpMREFkRR8mdJRLD9ZiNFLD0vR9O0ix0LQViEi8RNw8SCMfWNuz7AcZOoUdx3xKcaL-ZT0iPJQZntRg7QtKYdk47jBVsGxxW9JRvEaQQRLgEQ-GuOd-xUzNdCsJ19FUIVFnePJXQkSCZj9aDKzMoUnkwmyHzAVKlIzCRtHLHKcny0UIMcV0nEUW093A-Q7BrVRavw+qiIxRrTQXFrSmUPQOudLqiu+PI-NrSClD40V7WPcb5VsjsnzhGa6IyiR8j8+xRVtN4xR0V0Ntza1dD9SYnh9DQLJwsSJvbc70vSVQ-I0p0ZELT4eu+PqFAG3Yax2wMcl+qz-qOybUWm380u8xAnGA8HSihrS3GexxNreuQjw3NwVDR0S8Mx9sVVO3ggfxjYvRmbMIdJlYKaplZrQ8GxmWrU8wFEVA0Q4MFz0B3GmoXXZFEWWwSY+MneqcLZqkRgFTygVBeCVxTZvox5KlArXXkF2G9aqHY9jqOLPCAA */
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
    periodicProjectsPage: {
      states: {
        idle: {
          on: {
            SELECT_PROJECTS_MODE: {
              target: "select",
              actions: "assignSelectedProjectIds",
              reenter: true
            }
          }
        },
        select: {
          on: {
            SELECT_PROJECT: {
              target: "select",
              actions: "assignSelectedProjectId"
            },

            CLEAR_SELECTED_PROJECT_IDS: {
              target: "select",
              actions: "clearSelectedProjectIds"
            },

            IDLE_PROJECTS_MODE: {
              target: "idle",
              actions: "clearSelectedProjectIds",
              reenter: true
            }
          }
        }
      },

      initial: "idle"
    },
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