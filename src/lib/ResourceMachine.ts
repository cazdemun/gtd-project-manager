import { setup, fromPromise, assign, assertEvent, createActor } from 'xstate';

const API_SEGMENT = 'api/'

const fetchResources = async <T extends Resource>(collection: string): Promise<T[]> => {
  const response = await fetch(`${API_SEGMENT}${collection}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch resource ${collection}`);
  }

  return response.json();
};

const createResources = async <T extends Resource>(collection: string, newResources: NewResource<T> | NewResource<T>[]): Promise<T[]> => {
  const response = await fetch(`${API_SEGMENT}${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newResources),
  });

  if (!response.ok) {
    throw new Error('Failed to create resource');
  }

  return response.json();
};

const updateResources = async <T extends Resource>(collection: string, updatedResources: UpdatableResource<T> | UpdatableResource<T>[]): Promise<number> => {
  const response = await fetch(`${API_SEGMENT}${collection}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedResources),
  });

  if (!response.ok) {
    throw new Error('Failed to update resource');
  }

  return response.json();
};

const deleteResources = async (collection: string, resourceIds: string | string[]): Promise<void> => {
  const ids = Array.isArray(resourceIds) ? resourceIds : [resourceIds];
  const response = await fetch(`${API_SEGMENT}${collection}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    throw new Error('Failed to delete resource');
  }
}

type ResourceMachineContext<T extends Resource> = {
  resources: T[];
  resourcesMap: Map<string, T>;
  collection: string;
  error: string | undefined;
};

type ResourceMachineEvent<T extends Resource> =
  | { type: 'FETCH'; afterFetch?: () => void | Promise<void> }
  | { type: 'CREATE'; newResources: NewResource<T> | NewResource<T>[]; afterCreate?: () => void | Promise<void> }
  | { type: 'UPDATE'; updatedResources: UpdatableResource<T> | UpdatableResource<T>[]; afterUpdate?: () => void | Promise<void> }
  | { type: 'DELETE'; resourceIds: string | string[]; afterDelete?: () => void | Promise<void> };

export const createResourceMachine = <T extends Resource>() => {
  return setup({
    types: {
      context: {} as ResourceMachineContext<T>,
      events: {} as ResourceMachineEvent<T>,
      input: {} as {
        collection: string,
      },
    },
    actors: {
      fetchResources: fromPromise<T[], { collection: string, afterFetch?: () => void | Promise<void> }>(async ({ input }) => {
        const user = await fetchResources<T>(input.collection);
        input.afterFetch?.();
        return user;
      }),
      createResources: fromPromise<T[], { collection: string, newResources: NewResource<T> | NewResource<T>[], afterCreate?: () => void | Promise<void> }>(async ({ input }) => {
        const resources = await createResources<T>(input.collection, input.newResources);
        input.afterCreate?.();
        return resources;
      }),
      updateResources: fromPromise<number, { collection: string, updatedResources: UpdatableResource<T> | UpdatableResource<T>[], afterUpdate?: () => void | Promise<void> }>(async ({ input }) => {
        const updatedCount = await updateResources<T>(input.collection, input.updatedResources);
        input.afterUpdate?.();
        return updatedCount;
      }),
      deleteResources: fromPromise<void, { collection: string, resourceIds: string | string[], afterDelete?: () => void | Promise<void> }>(async ({ input }) => {
        await deleteResources(input.collection, input.resourceIds);
        input.afterDelete?.();
      }),
    },
    actions: {
      assignError: assign({
        error: ({ event }) => {
          if ((event as unknown as { error: Error }).error && (event as unknown as { error: Error }).error.message) {
            return (event as unknown as { error: Error }).error.message;
          }
          return `Unknown error occurred on: ${event.type}`;
        }
      }),
      clearError: assign({
        error: undefined,
      }),
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc4HsCuyDGYB0AlhADZgDEAYgKIAqAwgBIDaADALqKgAOasBALgTQA7TiAAeiAIwBOAKx4ZSmQA4ALGoBMalXM1SAzABoQAT0Sb1iqSzUB2W+rksZmgwF93J1LEw58RKRkdABKVACCNFSsHEggPHyCImKSCLIKyqoa2rr6xmaIanIKBroqLPoyAGwyBvKe3uhYuIQk5ACqAAoAIpHR7GIJAkKicanpisrqWjp6hibmCFWaCipVUlLOGgaaDmoNID5+LYHk3VQAMrT9sdy8w8lj0vKTStM5c-mLdtV4BgZVNSqKoqaosKT7LyHJr+PAAMzA-GwAAsCMIoGQICIAsIAG5oADW+ARSNR6JCMNwsBig3uSVGoFSawUdhsrLsVQMLjcdgWiFBLEUOykDk0VUcchkByOzWJiJRaIxYGQyDQyDwXGIAEN+HC1QBbeHyslQCm+WXUgZxIb0lKIVwGPDOFRuCEaZxSTR8hAyNR4EFyQwsBw1WS2aWU-DYVA6xWY7GEPGEqMxwTkyOW27xOkjO0INaCgye1Qrbli71qAx2J0aTYGQN2OSA8NQmWw6NgWPosjK1XqzU6vXIQ0drumjM0605x6MxBNx1csWaFguuwAjbeotVf3inSszQyOwqCPm2EYLgQMfx4Q4-FEvDny9p8enqmTu6JXNPfPiv7Fl3OK45YFEsK54OC8g2BBYo1Cexz4I+V69mqGrarqBoPheY5mvBma0p+M4SM8GRTNksx5N6zirLoHK1C4h4qLocGyngEBgKQz7XreyasexiKKjhFrvtmBEMkRP6Fv+pZAVU3p2EeeBAjoQJvICHLMbCbEcXGyH9mhQ6Glp-Hpq+cDCTaX6zggy6aHgNichsTiHiC3pVByfzrBsjbzi4x4HMIaBsfAcRtrg+EPGJqQALSySB1ZSLohiGEWeihn5jSma0pDhba35aJRahSHZbhFJsch1KCHitpGRqkoqOWWeJGy-MGRRrEWe6ct6awyHguw1LuDhcnYkIZfBeCjs+DWEakQJFSupQqJ6KjeQlFYJYooYbFIIJFnUGktIhU1TqJeY6L11SuOUyXlP8lGgopGhAto647HIB34EZx0fhFZ0yEVagsG5S0yLYdg8mocmStYwJyBoNGuJ4nhAA */
    id: 'resource',
    initial: 'idle',
    context: ({ input }) => ({
      resources: [],
      resourcesMap: new Map(),
      collection: input.collection,
      error: undefined,
    }),
    states: {
      idle: {
        on: {
          FETCH: { target: 'fetching' },
          CREATE: { target: 'creating' },
          UPDATE: { target: 'updating' },
          DELETE: { target: 'deleting' },
        },
      },

      fetching: {
        invoke: {
          id: 'fetchingResources',
          src: 'fetchResources',
          entry: 'clearError',
          input: ({ context: { collection }, event }) => {
            try {
              assertEvent(event, ['FETCH']);
              const { afterFetch } = event;
              return { collection, afterFetch }
            } catch {
              return { collection }
            }
          },
          onDone: {
            target: 'idle',
            actions: assign({
              resources: ({ event }) => event.output,
              resourcesMap: ({ event }) => new Map(event.output.map((resource) => [resource._id, resource])),
            }),
          },
          onError: {
            target: 'idle',
            actions: 'assignError',
          },
        },
      },

      creating: {
        invoke: {
          id: 'creatingResources',
          src: 'createResources',
          entry: 'clearError',
          input: ({ context: { collection }, event }) => {
            assertEvent(event, 'CREATE');
            const { newResources, afterCreate } = event;
            return { collection, newResources, afterCreate }
          },
          onDone: {
            target: 'fetching',
          },
          onError: {
            target: 'idle',
            actions: 'assignError',
          },
        },
      },

      updating: {
        invoke: {
          id: 'updatingResources',
          src: 'updateResources',
          entry: 'clearError',
          input: ({ context: { collection }, event }) => {
            assertEvent(event, 'UPDATE');
            const { updatedResources, afterUpdate } = event;
            return { collection, updatedResources, afterUpdate }
          },
          onDone: {
            target: 'fetching',
          },
          onError: {
            target: 'idle',
            actions: 'assignError',
          },
        },
      },

      deleting: {
        invoke: {
          id: 'deletingResources',
          src: 'deleteResources',
          entry: 'clearError',
          input: ({ context: { collection }, event }) => {
            assertEvent(event, 'DELETE');
            const { resourceIds } = event;
            return { collection, resourceIds }
          },
          onDone: {
            target: 'fetching',
          },
          onError: {
            target: 'idle',
            actions: 'assignError',
          },
        },
      }
    },
  })
};

export const createResourceActor = <T extends Resource>(collection: string) => {
  const machine = createResourceMachine<T>();
  return createActor(machine, { input: { collection } });
}