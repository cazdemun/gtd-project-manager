import { v4 as uuidv4 } from 'uuid';
import { isDoneDate } from './dates';

// https://www.regular-expressions.info/conditional.html
// https://stackoverflow.com/questions/39222950/regular-expression-with-if-condition
// - A project always starts with a title, which is a line starting with a hyphen.
// - We capture everything lazily until we finish the ID. 
// - If there is no ID, we capture until the start of the next project or the end of the file.
export const RAW_PROJECT_REGEX = /^- .*?(?:(?=<!--ID: [a-f0-9-]{36}-->$)<!--ID: [a-f0-9-]{36}-->$|(?=^-|<<END>>))/gms;

const RAW_PROJECT_UUID_REGEX = /<!--ID: ([a-f0-9-]{36})-->$/;
const RAW_PROJECT_TITLE_REGEX = /^-.*?$/gms;
const RAW_PROJECT_ACTIONS_REGEX = /^[ \t]+-.*?$/gms;
const RAW_PROJECT_DESCRIPTION_REGEX = /(?:^[ \t]*-.*?\n)+(.*?)(?=^<!--ID:|^#)/gms;
const RAW_PROJECT_TAGS_REGEX = /^#.*?(?=^<!--ID:)/gms;

export function isNullish<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

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
 * Load a project from a text string.
 * 
 * This function is part of a processing pipeline that assumes the raw project string contains 
 * an ID at the final line. If the ID is not found, the function will return undefined. For this
 * schema, if the title is not found either, the function will return undefined, as is the minimal
 * information required to create a project.
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
 * <!--ID: 123e4567-e89b-12d3-a456-426614174000-->`)`
 * 
 * // Returns: {
 * //   _id: '123e4567-e89b-12d3-a456-426614174000',
 * //   rawText: `...`,
 * //   title: 'Title',
 * //   description: 'Description',
 * //   actions: ['- Task 1', '- Task 2'],
 * //   tags: ['#tag1', '#tag2'],
 * // }
 */
export function textToTextProject(text: string): TextProject | undefined {
  const idMatch = text.match(RAW_PROJECT_UUID_REGEX);
  const _id = idMatch ? idMatch[1] : '';

  if (!_id) return undefined;

  const titleMatch = text.match(RAW_PROJECT_TITLE_REGEX);
  const _title = titleMatch ? (titleMatch[0] ?? '') : '';
  const title = _title?.trim() ?? '';

  if (title === '') return undefined;

  const actionsMatch = text.match(RAW_PROJECT_ACTIONS_REGEX);
  const actions: string[] = (actionsMatch ?? [])
    .map((action) => action.trim());

  const descriptionMatch = [...text.matchAll(RAW_PROJECT_DESCRIPTION_REGEX)][0];
  const _description = descriptionMatch ? descriptionMatch[1] : '';
  const description = _description?.trim() ?? '';

  const tagsMatch = text.match(RAW_PROJECT_TAGS_REGEX)
  const _tags = tagsMatch ? tagsMatch[0] : '';
  const tags = (_tags ?? '').trim().split(' ')
    .filter((tag) => tag !== '')
    .filter((tag) => tag.startsWith('#'));

  return {
    _id,
    rawProject: text,
    title,
    actions,
    description,
    tags,
  };
}

export function textProjectToText(project: TextProject): string {
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

export function textProjectsToText(projects: Project[]): string {
  return projects.map(textProjectToText).join('\n\n') + '\n<<END>>';
}

function isTextProjectPeriodic(textProject: TextProject): boolean {
  return textProject.title.match(/- .*?#periodic/) !== null;
}

function textProjectToProject(textProject: TextProject, projectsMap: Map<string, Project>, newOrder: number): Project {
  const order = projectsMap.get(textProject._id)?.order ?? newOrder;
  return {
    ...textProject,
    order: order,
    periodic: isTextProjectPeriodic(textProject),
  };
}

export function textProjectsToProjects(textProjects: TextProject[], projects: Project[]): Project[] {
  const lastOrder = projects.reduce((acc, resource) => Math.max(acc, (resource as { order?: number })?.order ?? 0), 0)
  const projectsMap = new Map(projects.map((project) => [project._id, project]));
  const projectsToCreate = textProjects.map((textProject, index) => textProjectToProject(textProject, projectsMap, lastOrder + index + 1));
  return projectsToCreate;
}

// --- Project Utils ---

export function isProjectDone(project: Project): boolean {
  return project.title.includes('[x]') || project.title.includes('[X]');
}

export function isProjectIncubated(project: Project): boolean {
  return project.title.includes('[?]');
}



export const getCountedTags = (projects: Project[], dateFilter: number | undefined): [Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>] => {
  const pendingTagsCount: Record<string, number> = {};
  const doneTagsCount: Record<string, number> = {};
  const incubatedTagsCount: Record<string, number> = {};
  const overallTags: Record<string, number> = {};

  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      pendingTagsCount[tag] = (pendingTagsCount[tag] ?? 0);
      doneTagsCount[tag] = (doneTagsCount[tag] ?? 0);
      incubatedTagsCount[tag] = (incubatedTagsCount[tag] ?? 0);
      overallTags[tag] = (overallTags[tag] ?? 0) + 1;

      if (isProjectDone(project)) {
        if (isDoneDate(dateFilter, project.done)) {
          doneTagsCount[tag] = (doneTagsCount[tag] ?? 0) + 1;
        }
      } else if (isProjectIncubated(project)) {
        incubatedTagsCount[tag] = (incubatedTagsCount[tag] ?? 0) + 1;
      } else {
        pendingTagsCount[tag] = (pendingTagsCount[tag] ?? 0) + 1;
      }
    });

  });

  return [pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags];
};

export const getSortedTags = (tagCount: Record<string, number>): string[] => {
  return Object.entries(tagCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([tag]) => tag);
};

export const getTagsAndCount = (projects: Project[], dateFilter: number | undefined): [string[], Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>] => {
  const [pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags] = getCountedTags(projects, dateFilter);
  const tags = getSortedTags(pendingTagsCount);
  return [tags, pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags];
};
