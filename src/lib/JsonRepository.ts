import fs from 'fs/promises';
import path from 'path';
import { _create, _delete, _deleteMany, _find, _update, _updateMany } from './resourceUtils';

const STORAGE_DIR = './data';

// TODO: There is a bug where the database can be wiped out if loading goes wrong but saving goes right.
export default class JsonRepository<T extends Resource> implements Repository<T> {
  collection: string;
  filePath: string;
  verbose: boolean;

  constructor(collection: string, storageDir?: string, verbose: boolean = false) {
    this.collection = collection;
    const storageDirPath = storageDir ?? STORAGE_DIR;
    this.filePath = path.join(storageDirPath, `${collection}.json`);
    this.verbose = verbose;
    this._ensureDirectoryExists(storageDirPath);
  }

  async read(query?: Record<string, string>): Promise<T[]> {
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

  // ---- Private helpers ----

  private async _ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory);
    } catch {
      await fs.mkdir(directory, { recursive: true });
    }
  }

  private async _saveResources(data: T[]): Promise<boolean> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 0), 'utf8');
      return true;
    } catch (error: unknown) {
      console.error(`(_saveResources) Failed to save resources: ${this.filePath}`);
      console.error(error);
      return false;
    }
  }

  private async _loadResources(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error: unknown) {
      console.error(`(_loadResources) Failed to load resources: ${this.filePath}`);
      console.error(error);
      return [];
    }
  }
}
