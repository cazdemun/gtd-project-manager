import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = './data';

export type Resource = {
  _id: string;
};

export type NewDoc<T extends Resource> = Partial<Pick<T, '_id'>> & Omit<T, '_id'>;
export type UpdateManyDoc<T extends Resource> = Pick<T, '_id'> & Partial<Omit<T, '_id'>>;

export default class Repository<T extends Resource, C extends string = string> extends EventEmitter {
  collection: C;
  filePath: string;
  verbose: boolean;

  constructor(collection: C, storageDir: string, verbose: boolean = false) {
    super();
    this.collection = collection;
    this.filePath = path.join(storageDir, `${collection}.json`);
    this.verbose = verbose;

    this.ensureDirectoryExists(storageDir);
  }

  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory);
    } catch {
      await fs.mkdir(directory, { recursive: true });
    }
  }

  private async loadCollection(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (err: unknown) {
      if ((err as { code: string }).code === 'ENOENT') {
        // File does not exist, return an empty array
        return [];
      }
      throw err;
    }
  }

  private async saveCollection(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 0), 'utf8');
  }

  async read(query?: Record<string, string>): Promise<T[]> {
    const items = await this.loadCollection();
    if (!query) return items;
    return items.filter((item: T) =>
      Object.entries(query).every(([key, value]) => item[key as keyof T] === value)
    );
  }

  async create(newDocs: NewDoc<T> | NewDoc<T>[]): Promise<T[]> {
    const items = await this.loadCollection();
    const _newItems = Array.isArray(newDocs) ? newDocs : [newDocs];
    const newItems = _newItems.map((item) => {
      if (!item._id) item._id = uuidv4();
      return item as T;
    });
    const updatedItems = [...items, ...newItems];
    await this.saveCollection(updatedItems);
    return newItems as T[];
  }

  /**
   * TODO: Enforce property types
   */
  private _update(_id: string, updatedDoc: Partial<T>, items: T[]): [T[], number] {
    const index = items.findIndex((item) => item._id === _id);
    if (index === -1) return [items, 0];

    const { _id: updatedId, ...updatedDocWithoutId } = updatedDoc;

    if (this.verbose && updatedId && updatedId !== _id) {
      console.warn(`You shouldn't update ids, but you were trying to update an item _id (${updatedId}) with:`, _id);
    }

    items[index] = { ...items[index], ...updatedDocWithoutId };
    return [items, 1];
  }

  async update(_id: string, updatedDoc: Partial<T>): Promise<number> {
    if (!_id) return 0;
    const items = await this.loadCollection();
    const [updatedItems, updates] = this._update(_id, updatedDoc, items);
    if (updates > 0) {
      await this.saveCollection(updatedItems);
    }
    return updates;
  }

  async updateMany(docs: UpdateManyDoc<T>[]): Promise<number> {
    if (docs.length === 0) return 0;
    let total = 0;
    let items = await this.loadCollection();

    for (const { _id, ...doc } of docs) {
      const [updatedItems, updates] = this._update(_id, doc as Partial<T>, items);
      items = updatedItems;
      total += updates;
    }

    if (total > 0) {
      await this.saveCollection(items);
    }

    return total;
  }

  async delete(_id: string): Promise<number> {
    if (!_id) return 0;
    const items = await this.loadCollection();
    const filteredItems = items.filter((item) => item._id !== _id);
    if (items.length === filteredItems.length) return 0;
    await this.saveCollection(filteredItems);
    return 1;
  }

  async deleteMany(_ids: string[]): Promise<number> {
    if (_ids.length === 0) return 0;
    const items = await this.loadCollection();
    const filteredItems = items.filter((item) => !_ids.includes(item._id));
    const count = items.length - filteredItems.length;
    if (count === 0) return 0;
    await this.saveCollection(filteredItems);
    return count;
  }

  static createRepository<T extends Resource, C extends string = string>(collection: C, _storageDir?: string, verbose?: boolean): Repository<T, C> {
    const storageDir = _storageDir ?? STORAGE_DIR;
    return new Repository<T, C>(collection, storageDir, verbose);
  }
}
