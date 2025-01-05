import { Resource } from '@/lib/Repository';
import { setup, assign, assertEvent, createActor } from 'xstate';

type MachineContext<T extends Resource> = {
  selectedResource?: T;
};

type MachineEvent<T> =
  | { type: 'OPEN_UPDATE_MODAL'; resource: T }
  | { type: 'CLOSE_MODAL'; }

export const createResourceUIMachine = <T extends Resource>() => {
  return setup({
    types: {
      context: {} as MachineContext<T>,
      events: {} as MachineEvent<T>,
    },
    actions: {
      assignSelectedResource: assign({
        selectedResource: ({ event }) => {
          assertEvent(event, 'OPEN_UPDATE_MODAL');
          return event.resource;
        }
      }),
      clearSelectedResource: assign({
        selectedResource: undefined,
      }),
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc4HsCuyDGYMEsBiAeQAUBRAOQH0BVUgEQEEAVc6gWWOYBkBtAAwBdRKAAOaWPgAu+NADtRIAB6IALAGYAjADoAnAb0AONQHY1WgExaBetQBoQAT0QBaLaZ1rDeyxtMCAGwCAKxmAL7hjqiwmDh4RADCPMQAyuxcvIIiSCASUrIKSqoIlpZ6+oYm5lY2do4uCO6e3oZ+AcFhppFRIPJoEHBKMXG4BEr5MnKKuSVaRro+1RbWtg7ObjZqlW3+QaERvSNYY-g6+BAANmATklNFs4iW5jqmeoFGIXo1q-UbCFtXpZAiFTJYBBpAuZtIFItF0CcEjoMGIIABDaRgDgDNGXW4FabFdSmXQCASmN5glZ1daNQFgkFgiFQzRaWE9IA */
    id: 'resourceui',

    initial: 'idle',

    context: {
      selectedResource: undefined
    },

    states: {
      idle: {},
      updateModal: {}
    },

    on: {
      OPEN_UPDATE_MODAL: {
        target: ".updateModal",
        actions: "assignSelectedResource"
      },

      CLOSE_MODAL: {
        target: ".idle",
        actions: "clearSelectedResource"
      }
    }
  })
};

export const createResourceUIActor = <T extends Resource>() => {
  const machine = createResourceUIMachine<T>();
  return createActor(machine);
}