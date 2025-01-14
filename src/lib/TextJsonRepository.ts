import JsonRepository from '@/lib/JsonRepository';
import TextRepository from '@/lib/TextRepository';
import { BaseRepository } from './BaseRepository';
import { _create, _deleteMany, _updateMany } from './resourceUtils';

export interface TextJsonRepositoryOptions<T extends U, U extends Resource> {
  /**
   * Convert a text resource into a json resource.
   * 
   * We do this because a json resource could have extra metadata that is not present in the text resource when they are created.
   */
  expandTextResources: (textResourcesToCreate: U[], jsonResources: T[]) => T[];
}

export default class TextJsonRepository<T extends U, U extends Resource> extends BaseRepository<T> {
  private textRepository: TextRepository<U>;
  private jsonRepository: JsonRepository<T>;
  private options: TextJsonRepositoryOptions<T, U>;

  constructor(textRepository: TextRepository<U>, jsonRepository: JsonRepository<T>, options: TextJsonRepositoryOptions<T, U>) {
    super();
    this.textRepository = textRepository;
    this.jsonRepository = jsonRepository;
    this.options = options;
  }

  // ---- Helpers ----

  private isIn(resources: (T | U)[], aResource: T | U): boolean {
    return resources.some((bResource) => aResource._id === bResource._id);
  }

  // We typecast `resources` to `U[]` since T extends U and serialization (U -> string) will simply ignore the extra properties
  async _saveResources(resources: T[]): Promise<boolean> {
    try {
      await this.jsonRepository._saveResources(resources);
      await this.textRepository._saveResources(resources as U[]);
      return true;
    } catch (error: unknown) {
      console.error(`(_saveResources) Failed to save resources`);
      console.error(error);
      return false;
    }
  }

  async _loadResources(): Promise<T[]> {
    try {
      const textResources = await this.textRepository.read();
      const jsonResources = await this.jsonRepository.read();

      // Delete resources that are not in the text file
      const resourcesToDelete = jsonResources.filter((jsonRes) => !this.isIn(textResources, jsonRes));
      const [jsonResourcesAfterDelete] = _deleteMany(jsonResources, resourcesToDelete.map((resource) => resource._id));

      // Update resources that are in both the text file and the json file
      // We filter `textResources` as it contains new resources that are not in the json file
      // User expanded resources helps when new properties are added so we updated the already existing resources
      const resourcesToUpdate = textResources.filter((textRes) => this.isIn(jsonResources, textRes));
      const expandedResourcesToUpdate = this.options.expandTextResources(resourcesToUpdate, jsonResourcesAfterDelete);
      const [jsonResourcesAfterUpdate] = _updateMany(jsonResourcesAfterDelete, expandedResourcesToUpdate);

      // Create resources that are in the text file but not in the json file
      const resourcesToCreate = textResources.filter((textRes) => !this.isIn(jsonResourcesAfterUpdate, textRes))
      const expandedResourcesToCreate = this.options.expandTextResources(resourcesToCreate, jsonResourcesAfterUpdate);
      const jsonResourcesAfterCreate = _create(jsonResourcesAfterUpdate, expandedResourcesToCreate);

      await this.jsonRepository._saveResources(jsonResourcesAfterCreate);
      return await this.jsonRepository.read();
    } catch (error: unknown) {
      console.error(`(_loadResources) Failed to load resources`);
      console.error(error);
      return [];
    }
  }
}
