import { RAW_PROJECT_ACTIONS_REGEX, RAW_PROJECT_DESCRIPTION_REGEX, RAW_PROJECT_TAGS_REGEX, RAW_PROJECT_TITLE_REGEX, RAW_PROJECT_UUID_REGEX } from "./constants";

// --- Text Repository Utils ---

/**
 * Load a project from a text string.
 * 
 * This function is part of a processing pipeline that assumes the raw project string contains an ID at the final line.
 * 
 * If the ID is not found, the function will return undefined. 
 * 
 * For this schema, if the title is not found either, the function will return undefined, as is the minimal information required to create a project.
 * 
 * @param text - The raw project string.
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
 * 
 * @note This function is used to convert the text fragment (from a splitted text file) into a TextProject, which is a subset of Project.
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

// --- Text Json Repository Utils ---

export function isTextProjectPeriodic(textProject: TextProject): boolean {
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