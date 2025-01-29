import { setup, assign, assertEvent, createActor } from 'xstate';

type MachineContext<T extends Resource, COptions = object> = {
  selectedResource?: T;
  createOptions?: COptions;
};

// TODO: Add OPEN_DELETE_MODAL
type MachineEvent<T extends Resource, COptions = object> =
  | { type: 'OPEN_CREATE_MODAL'; createOptions?: COptions }
  | { type: 'OPEN_UPDATE_MODAL'; resource: T }
  | { type: 'CLOSE_MODAL'; }

export const createResourceUIMachine = <T extends Resource, COptions = object>() => {
  return setup({
    types: {
      context: {} as MachineContext<T, COptions>,
      events: {} as MachineEvent<T, COptions>,
    },
    actions: {
      assignSelectedResource: assign({
        selectedResource: ({ event }) => {
          assertEvent(event, 'OPEN_UPDATE_MODAL');
          return event.resource;
        }
      }),
      assignCreateOptions: assign({
        createOptions: ({ event }) => {
          assertEvent(event, 'OPEN_CREATE_MODAL');
          return event.createOptions;
        }
      }),
      clearSelectedResource: assign({
        selectedResource: undefined,
      }),
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc4HsCuyDGYMEsBiAeQAUBRAOQH0BVUgEQEEAVc6gWWOYBkBtAAwBdRKAAOaWPgAu+NADtRIAB6IALAGYAjADoAnAb0AONQHY1WgExaBetQBoQAT0QBaLaZ1rDeyxtMCAGwCAKxmAL7hjqiwmDh4RADCPMQAyuxcvIIiSCASUrIKSqoIlpZ6+oYm5lY2do4uCO6e3oZ+AcFhppHR6Fi4BCQUNIkASuSsGdxM-MJK+TJyirklgSEaOgKmRloagWoHtlpGDW4eXoamplo3O-tBkVEg8mgQcEoxcQP485KLRStEMddD5qhZrLYHM4zgI1JUDKYQojAtsQpYeiBPv0Ejp8BAADZgX4FJbFRCWcw6Ux6QJGEJ6GoQ+rQhA2OGmSxrDkCPbmbSBDFY+IEHQYMQQACG0jAHFeEvxxP+y1AJTMugEW2pHPBdShjTZVM5SMsPJRmi0AqeQu+OmwqClMrlCtyC0KypUiECdk22ksISMAauNJCp1ZsMNXJNvPNlsiQA */
    id: 'resourceui',

    initial: 'idle',

    context: {
      selectedResource: undefined
    },

    states: {
      idle: {},
      updateModal: {},
      createModal: {}
    },

    on: {
      OPEN_UPDATE_MODAL: {
        target: ".updateModal",
        actions: "assignSelectedResource"
      },

      CLOSE_MODAL: {
        target: ".idle",
        actions: "clearSelectedResource"
      },

      OPEN_CREATE_MODAL: {
        target: ".createModal",
        actions: "assignCreateOptions"
      }
    }
  })
};

export const createResourceUIActor = <T extends Resource, COptions = object>() => {
  const machine = createResourceUIMachine<T, COptions>();
  return createActor(machine);
}