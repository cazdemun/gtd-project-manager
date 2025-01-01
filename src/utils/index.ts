import { v4 as uuidv4 } from 'uuid';

// https://www.regular-expressions.info/conditional.html
// https://stackoverflow.com/questions/39222950/regular-expression-with-if-condition
const RAW_PROJECT_REGEX = /^- .*?(?:(?=<!--ID: [a-f0-9-]{36}-->$)<!--ID: [a-f0-9-]{36}-->$|(?=^-|<<END>>))/gms;

const RAW_PROJECT_UUID_REGEX = /<!--ID: ([a-f0-9-]{36})-->$/;
const RAW_PROJECT_TITLE_REGEX = /^-.*?$/gms;
const RAW_PROJECT_ACTIONS_REGEX = /^[ \t]+-.*?$/gms;
const RAW_PROJECT_DESCRIPTION_REGEX = /(?:^[ \t]*-.*?\n)+(.*?)(?=^<!--ID:|^#)/gms;
const RAW_PROJECT_TAGS_REGEX = /^#.*?(?=^<!--ID:)/gms;

export function getRawProjects(rawText: string): string[] {
  return rawText.match(RAW_PROJECT_REGEX) ?? [];
}

/**
 * Adds an identifier to a the end of a raw project string.
 * 
 * This function is part of a processing pipeline where:
 * - The raw project ends in a new line if it does not contain an identifier.
 * - The raw project ends at the end of the line where the identifier is located.
 * 
 * Based on this, the returned value will never have a new line at the end.
 */
export function insertIdentifierToRawProject(rawProject: string): string {
  const uuidRegex = /<!--ID: [a-f0-9-]{36}-->/;
  if (!uuidRegex.test(rawProject)) {
    return `${rawProject}<!--ID: ${uuidv4()}-->`;
  }
  return `${rawProject}`;
}

export function convertRawProjectsToRawText(rawProjects: string[]): string {
  const updatedRawText = `${rawProjects.join('\n')}\n<<END>>`;
  return updatedRawText;
}

/**
 * Load a project from a raw project string.
 * 
 * This function is part of a processing pipeline that assumes 
 * the raw project string contains an ID at the final line. 
 * 
 * If the ID is not found, the function will return undefined.
 * 
 * @param rawProject - The raw project string.
 * @returns The project or undefined if there is no ID detected.
 * @example
 * loadProjectFromRawProject(`
 * - Title
 *  - Task 1
 *  - Task 2
 * 
 * Additional description.
 * 
 * #tag1 #tag2
 * <!--ID: 123e4567-e89b-12d3-a456-426614174000-->`);
 * // Returns: {
 * //   _id: '123e4567-e89b-12d3-a456-426614174000',
 * //   rawText: `...`,
 * //   title: 'Title',
 * //   description: 'Description',
 * //   actions: ['- Task 1', '- Task 2'],
 * //   tags: ['#tag1', '#tag2'],
 * // }
 */
export function convertRawProjectToProject(rawProject: string): Project | undefined {
  const idMatch = rawProject.match(RAW_PROJECT_UUID_REGEX);
  const _id = idMatch ? idMatch[1] : '';

  if (!_id) {
    return undefined;
  }

  const titleMatch = rawProject.match(RAW_PROJECT_TITLE_REGEX);
  const title = titleMatch ? titleMatch[0] : '';

  const tagsMatch = rawProject.match(RAW_PROJECT_TAGS_REGEX)
  const _tags = tagsMatch ? tagsMatch[0] : '';
  const tags = (_tags ?? '').trim().split(' ')
    .filter((tag) => tag !== '')
    .filter((tag) => tag.startsWith('#'));

  const actionsMatch = rawProject.match(RAW_PROJECT_ACTIONS_REGEX);
  const actions: string[] = actionsMatch ? actionsMatch : [];

  const descriptionMatch = [...rawProject.matchAll(RAW_PROJECT_DESCRIPTION_REGEX)][0];
  const description = descriptionMatch ? descriptionMatch[1] : '';

  return {
    _id,
    rawProject,
    title: title?.trim() ?? '',
    actions: actions.map((action) => action.trim()),
    description: description?.trim() ?? '',
    tags,
  };
}

export function convertProjectToRawProject(project: Project): string {
  // project content
  const actions = project.actions.map((action) => `\t${action}`).join('\n');
  const titleActionsSeparator = actions.length > 0 ? '\n' : '';
  const projectContent = `${project.title}${titleActionsSeparator}${actions}`;
  // project reference
  const contentReferenceSeparator = project.description.length > 0 ? '\n\n' : '';
  const projectReference = `${contentReferenceSeparator}${project.description}`;
  // project metadata
  const tags = project.tags.join(' ');
  const tagsIdSeparator = tags.length > 0 ? '\n' : '';
  const projectMetadata = `\n\n${tags}${tagsIdSeparator}<!--ID: ${project._id}-->`

  return `${projectContent}${projectReference}${projectMetadata}`;
}

export function convertProjectsToRawText(projects: Project[]): string {
  return projects.map(convertProjectToRawProject).join('\n') + '\n<<END>>';
}