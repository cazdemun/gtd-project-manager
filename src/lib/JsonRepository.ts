import fs from 'fs/promises';
import path from 'path';
import { BaseRepository } from './BaseRepository';

const STORAGE_DIR = './data';

// TODO: There is a bug where the database can be wiped out if loading goes wrong but saving goes right.
export default class JsonRepository<T extends Resource> extends BaseRepository<T> {
  collection: string;
  filePath: string;
  verbose: boolean;

  constructor(collection: string, storageDir?: string, verbose: boolean = false) {
    super();
    this.collection = collection;
    const storageDirPath = storageDir ?? STORAGE_DIR;
    this.filePath = path.join(storageDirPath, `${collection}.json`);
    this.verbose = verbose;
    this._ensureDirectoryExists(storageDirPath);
  }

  // ---- Helpers ----

  private async _ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory);
    } catch {
      await fs.mkdir(directory, { recursive: true });
    }
  }

  async _saveResources(data: T[]): Promise<boolean> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 0), 'utf8');
      return true;
    } catch (error: unknown) {
      console.error(`(_saveResources) Failed to save resources: ${this.filePath}`);
      console.error(error);
      return false;
    }
  }

  async _loadResources(): Promise<T[]> {
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
