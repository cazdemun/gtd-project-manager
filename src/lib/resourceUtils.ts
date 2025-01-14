import { v4 as uuidv4 } from 'uuid';

export function _find<T extends Resource>(resources: T[], query?: Record<string, string | boolean>): T[] {
  if (!query) return resources;
  return resources.filter((resource) =>
    Object.entries(query).every(([key, value]) => resource[key as keyof T] === value)
  );
}

export function _create<T extends Resource>(resources: T[], _newResources: NewResource<T> | NewResource<T>[]): T[] {
  const newResources = (Array.isArray(_newResources) ? _newResources : [_newResources])
    .map((item) => {
      if (!item._id) item._id = uuidv4();
      return item as T;
    });
  const updatedResources = [...resources, ...newResources];
  return updatedResources;
}

/**
 * TODO: Enforce property types
 */
export function _update<T extends Resource>(resources: T[], _id: string, updatedResource: Partial<T>,): [T[], number] {
  const index = resources.findIndex((item) => item._id === _id);
  if (index === -1) return [resources, 0];
  resources[index] = { ...resources[index], ...updatedResource };
  return [resources, 1];
}

export function _updateMany<T extends Resource>(resources: T[], docs: UpdatableResource<T>[]): [T[], number] {
  if (docs.length === 0) return [resources, 0];
  let totalUpdates = 0;
  for (const { _id, ...doc } of docs) {
    const [updatedResources, updated] = _update(resources, _id, doc as Partial<T>);
    resources = updatedResources;
    totalUpdates += updated;
  }
  return [resources, totalUpdates];
}

export function _delete<T extends Resource>(resources: T[], _id: string): [T[], number] {
  const filteredResources = resources.filter((resource) => resource._id !== _id);
  const removed = resources.length - filteredResources.length;
  return [filteredResources, removed];
}

export function _deleteMany<T extends Resource>(resources: T[], _ids: string[]): [T[], number] {
  const filteredResources = resources.filter((resource) => !_ids.includes(resource._id));
  const removed = resources.length - filteredResources.length;
  return [filteredResources, removed];
}