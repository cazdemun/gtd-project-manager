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
  | { type: 'OPEN_TAG_MANAGER'; }
  | { type: 'CLOSE_TAG_MANAGER'; }

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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBxA8gfQAUAlHAKQFEBhAFQGUBtABgF1FRUB7WASwBduOAOzYgAHogC0AVgAsANgB0jAIwAmNTMaqAHHPkB2ADQgAnpJ1SFATkYyLc7cqty9AX1fG0mXIXJEAkjgAIv6UhCQUNAwsIpw8-EIi4gjS2jIKMgDMmVZSOtqZmnJGpojqygpyyvrKjFpqLoza7p7o2PjkABoEADI4RH5MrEggcXwCwiPJ0jKWjFI2qlazqrJyqsZmKXmKNnLL+o5Wypn6mS0gXu14WATUQ7Fc44lTknkVMtpNqjL6VvoqGTKTaSOSMTIKZSaRhyKQLIHrfQXLwKVAAJw4ACswABjXiwAjIGAKbgQAA2YAwtHIPSo1HCZDptDwAFlguQHiMxglJqBpmcFADlMpiro1PpVMUQSlMk1KrK-lJMlC7A4pMj0KiMdi8QSiWAFLAwBS8Rh-EFaQzInRWezOewnjykqCKi4rDYpMptNpVDDPlJpRJ1KoFKp9LMspk9E5anINagtVjcfjCcSjSbeFSaXSrXT7aNHRNnQgdOl-pltDVTus6nJMoH1JZPU1nNo8uHiucPJdNeik7rUwb08mMJRaQBBIh4am0mjkIK5mh4c3RYYO+JF14lrKhkWMGpfeYyT6B2XaeXfQpe3KOLutBOoMBogQQbg4gja5N64mkilZ2f0sQjJRLaQQcjEXKFi8fKghCZz6BKXyzPsKwyNKmRSIwkLCjCdbFAhdbxqiT4vm+H79im+qGsaI4zjmQHWvm3KbjBJY1IKViFPoVQIZxPpyNKx6KAY2RnMcMhWG2RGPs+HCvu+n4DlRw6mmO5CTtO2ZzguDE5iuTFQbyYhlLKSgYS4Ua8RW9alAgGFYcKtRtseDRhnePYPiRclkYplFpjRprmpaukgWyYEGRu0HGdsFQAnohy2FIKF5GhtlCRknanDkUKSTI0lefJ5E6n5Bq-pSOAEOQAByeDUOOWCsuOVX1YMEHrs8RnJJKViVGC8UaG2-zSqoqgQlGIoOPoSrgus+WyYVvnfgavBEiyyCCPqaKjn01K1fVjXNVgrVrgWkWdWUsIKD68g3gYU3yMNaQZGk5m-EC4K2O43aCHJcAiF4jxncWEh1iGka5PkhQwiUWwgzYlTQrC8IimG0mLYOgMdcDIoVOZhTZKNCxfDZsM5IoJxNAhWSYeCzTdiifbFUtJLkmAmNOluEjCmNSX45khOSeCgbekohwSs4-N-FCcb0726PKQFvDsyx0UnCGZN-NCji2DowvnvuuicfzN5tu5DMFT5FFLcrUXTF6WG+noRu2J85nSiclhii4lbTVGqhzaRClW4OLMUjb50pGroZ+s7x4FEl0pSACvXKgCcJ-HWSKy5582W0zIcqUrkFA1uIrpLY9lunCZeJ8nFnXnWULqtnxG50H+dUStUBrRtMBouHxZJR8qxhnY1fuqlWxJ1h9dp0nEtZ-eChgKIqBkhwaJPhjxdY5zag9dDOi5ElqzegJtnSJK1gwscEr7rkIpEVAqC8Nv7Uc6xXMnAoeORgLxOBjBBCKEdRCiSSWNxKwX1XBAA */
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
            },

            OPEN_TAG_MANAGER: {
              target: "tagManager",
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
        },

        tagManager: {
          on: {
            CLOSE_TAG_MANAGER: {
              target: "idle",
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