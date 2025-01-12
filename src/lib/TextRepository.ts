import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { _create, _delete, _deleteMany, _find, _update, _updateMany } from './resourceUtils';

// TODO: Make end file token configurable
// TODO: Make id token configurable
// TODO: Preserve consistency between resource regex, end token, and id token
export interface TextRepositoryOptions<T extends Resource> {
  resourceRegex: RegExp;

  /**
   * Parse a raw chunk of text into a T.
   * Return `undefined` if parsing fails or the record is invalid.
   */
  parseTextResource: (textResource: string) => T | undefined;

  /**
   * Convert a T into raw text to be written back to the file.
   * 
   * Used for creating new records and updating existing ones.
  */
  serializeResource: (resource: T) => string;
}

// TODO: There is a bug where the database can be wiped out if loading goes wrong but saving goes right.
export class TextRepository<T extends Resource> implements Repository<T> {
  private filePath: string;
  private options: TextRepositoryOptions<T>;

  constructor(filePath: string, options: TextRepositoryOptions<T>) {
    this.filePath = filePath;
    this.options = options;
    this._ensureFileExists(filePath);
  }

  public async read(query?: Record<string, string>): Promise<T[]> {
    const resources = await this._loadResources();
    const filteredResources = _find(resources, query);
    return filteredResources;
  }

  public async create(newResources: NewResource<T> | NewResource<T>[]): Promise<T[]> {
    const text = await this._readFile();; // optimization
    const resources = await this._loadResources(text);
    const updatedResources = _create(resources, newResources);
    const success = await this._saveResources(updatedResources, text);
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

  private async _readFile(): Promise<string> {
    return await fs.readFile(this.filePath, 'utf-8');
  }

  private async _ensureFileExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '<<END>>', 'utf-8');
    }
  }

  private _normalizeTextResource(textResource: string): string {
    const uuidRegex = /<!--ID: [a-f0-9-]{36}-->/;
    if (!uuidRegex.test(textResource)) {
      return `${textResource}<!--ID: ${uuidv4()}-->`;
    }
    return `${textResource}`;
  }

  private _serializeResources(resources: T[]): string {
    const records = resources.map((item) => this.options.serializeResource(item));
    return records.join('\n\n') + '\n<<END>>';
  }

  private async _saveResources(resources: T[], _text?: string): Promise<boolean> {
    try {
      const text = _text ?? await this._readFile();
      const updatedText = this._serializeResources(resources);
      if (updatedText === text) return true;

      await fs.writeFile(this.filePath, updatedText, 'utf-8')

      return true;
    } catch (error: unknown) {
      console.error(`(_saveResources) Failed to save resources: ${this.filePath}`);
      console.error(error);
      return false;
    }
  }

  private async _loadResources(_text?: string): Promise<T[]> {
    try {
      const text = _text ?? await this._readFile();;
      const textResources = text.match(this.options.resourceRegex) ?? [] as string[];

      const resources = textResources
        .map((textResource) => this._normalizeTextResource(textResource))
        .map((textResource) => this.options.parseTextResource(textResource))
        .filter((textResource): textResource is T => textResource !== undefined);

      const sucess = await this._saveResources(resources, text);

      if (!sucess) return [];

      return resources;
    } catch (error: unknown) {
      console.error(`(_loadResources) Failed to load resources: ${this.filePath}`);
      console.error(error);
      return [];
    }
  }
}
