import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { _create } from './resourceUtils';
import { BaseRepository } from './BaseRepository';

type OverrideOptions = { text?: string }

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
  serializeTextResource: (resource: T) => string;
}

// TODO: There is a bug where the database can be wiped out if loading goes wrong but saving goes right.
export default class TextRepository<T extends Resource> extends BaseRepository<T> {
  private filePath: string;
  private options: TextRepositoryOptions<T>;

  constructor(filePath: string, options: TextRepositoryOptions<T>) {
    super();
    this.filePath = filePath;
    this.options = options;
    this._ensureFileExists(filePath);
  }

  public override async create(newResources: NewResource<T> | NewResource<T>[]): Promise<T[]> {
    const text = await this._readFile();; // optimization
    const resources = await this._loadResources({ text });
    const updatedResources = _create(resources, newResources);
    const success = await this._saveResources(updatedResources, { text });
    return success ? updatedResources : [];
  }

  // ---- Helpers ----

  private async _readFile(): Promise<string> {
    return await fs.readFile(this.filePath, 'utf-8');
  }

  private async _ensureFileExists(filePath: string): Promise<void> {
    await fs.access(filePath);
  }

  private _normalizeTextResource(textResource: string): string {
    const uuidRegex = /<!--ID: [a-f0-9-]{36}-->/;
    if (!uuidRegex.test(textResource)) {
      return `${textResource}<!--ID: ${uuidv4()}-->`;
    }
    return `${textResource}`;
  }

  private _serializeTextResources(resources: T[]): string {
    const records = resources.map((item) => this.options.serializeTextResource(item));
    return records.join('\n\n') + '\n<<END>>';
  }

  async _saveResources(resources: T[], options: OverrideOptions = {}): Promise<boolean> {
    try {
      const text = options?.text ?? await this._readFile();
      const updatedText = this._serializeTextResources(resources);
      if (updatedText === text) return true;

      await fs.writeFile(this.filePath, updatedText, 'utf-8')

      return true;
    } catch (error: unknown) {
      console.error(`(_saveResources) Failed to save resources: ${this.filePath}`);
      console.error(error);
      return false;
    }
  }

  async _loadResources(options: OverrideOptions = {}): Promise<T[]> {
    try {
      const text = options?.text ?? await this._readFile();;
      const textResources = text.match(this.options.resourceRegex) ?? [] as string[];

      const resources = textResources
        .map((textResource) => this._normalizeTextResource(textResource))
        .map((textResource) => this.options.parseTextResource(textResource))
        .filter((textResource): textResource is T => textResource !== undefined);

      const sucess = await this._saveResources(resources, { text });

      if (!sucess) return [];

      return resources;
    } catch (error: unknown) {
      console.error(`(_loadResources) Failed to load resources: ${this.filePath}`);
      console.error(error);
      return [];
    }
  }
}
