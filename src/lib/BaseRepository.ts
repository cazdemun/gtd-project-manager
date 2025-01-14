import { _create, _delete, _deleteMany, _find, _update, _updateMany } from './resourceUtils';

export abstract class BaseRepository<T extends Resource> implements Repository<T> {
  constructor() {
  }

  async read(query?: Record<string, string | boolean>): Promise<T[]> {
    const resources = await this._loadResources();
    const filteredResources = _find(resources, query);
    return filteredResources;
  }

  async create(newResources: NewResource<T> | NewResource<T>[]): Promise<T[]> {
    const resources = await this._loadResources();
    const updatedResources = _create(resources, newResources);
    const success = await this._saveResources(updatedResources);
    return success ? updatedResources : [];
  }

  public async update(_id: string, updatedDoc: Partial<T>): Promise<number> {
    const resources = await this._loadResources();
    const [updatedItems, updated] = _update(resources, _id, updatedDoc);
    if (updated > 0) await this._saveResources(updatedItems);
    return updated;
  }

  public async updateMany(updatedResources: UpdatableResource<T>[]): Promise<number> {
    const resources = await this._loadResources();
    const [updatedItems, updated] = _updateMany(resources, updatedResources);
    if (updated > 0) await this._saveResources(updatedItems);
    return updated;
  }

  public async delete(_id: string): Promise<number> {
    const resources = await this._loadResources();
    const [filteredItems, removed] = _delete(resources, _id);
    if (removed > 0) await this._saveResources(filteredItems);
    return removed;
  }

  public async deleteMany(_ids: string[]): Promise<number> {
    const resources = await this._loadResources();
    const [filteredItems, removed] = _deleteMany(resources, _ids);
    if (removed > 0) await this._saveResources(filteredItems);
    return removed;
  }

  protected abstract _loadResources(options?: Record<string, string>): Promise<T[]>;
  protected abstract _saveResources(resources: T[], options?: Record<string, string>): Promise<boolean>;
}
