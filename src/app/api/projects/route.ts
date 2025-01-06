import Repository, { Resource, UpdateManyDoc } from '@/lib/Repository';
import { convertProjectsToRawText, convertRawProjectToProject, getRawProjects, insertIdentifierToRawProject } from '@/utils';
import { promises as fs } from 'fs';

type ErrorResponse = {
  error: string;
};

const PROJECTS_PATH = process.env.PROJECTS_PATH;

const Projects = Repository.createRepository<Project>('projects');

// type Project = {
//   _id: string;
//   rawText: string;
//   tags: string[];
//   title: string;
//   description: string;
// }

// Normalize means adding a unique identifier and formatting the text with the correct spaces
const getFromFileAndNormalizeProjects = async (path: string): Promise<Project[]> => {
  // We query the raw text and make sure they are formatted correctly before sending them back
  const rawText = await fs.readFile(path, 'utf-8')
    .catch((err) => {
      console.error('Error reading projects file:', err);
      return '';
    })
  const rawProjects = getRawProjects(rawText);
  const updatedRawProjects = rawProjects
    .map((project) => insertIdentifierToRawProject(project));
  const projects = updatedRawProjects
    .map((project) => convertRawProjectToProject(project))
    .filter((project): project is Project => project !== undefined);
  const updatedRawText = convertProjectsToRawText(projects);

  // If the raw text has changed, we update the file, that way we avoid unnecessary writes
  if (rawText !== updatedRawText) {
    await fs.writeFile(path, updatedRawText, 'utf-8')
      .catch((err) => {
        console.error('Failed to write projects file', err);
        throw new Error('Failed to write projects file');
      });
  } else {
    console.log('Projects file is up to date');
  }

  return projects;
}

const synchronizeLocalProjects = async (projects: Project[]): Promise<Project[]> => {
  const localProjects = await Projects.read();
  // projects to delete
  const projectsToDelete = localProjects.filter((localProject) => !projects.some((project) => project._id === localProject._id));
  await Projects.deleteMany(projectsToDelete.map((project) => project._id));

  // projects to update
  const projectsToUpdate = projects.filter((project) => localProjects.some((localProject) => project._id === localProject._id));
  await Projects.updateMany(projectsToUpdate);

  const updatedLocalProjects = await Projects.read();
  const lastOrder = updatedLocalProjects.reduce((acc, project) => Math.max(acc, project.order ?? 0), 0);

  // projects to create
  const projectsToCreate = projects
    .filter((project) => !localProjects.some((localProject) => project._id === localProject._id))
    .map((project, index) => ({ ...project, order: project.order ?? lastOrder + index + 1 }));
  await Projects.create(projectsToCreate);

  return await Projects.read();
}

export async function GET(): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }

    const remoteProjects = await getFromFileAndNormalizeProjects(PROJECTS_PATH);
    const localProjects = await synchronizeLocalProjects(remoteProjects);

    return new Response(JSON.stringify(localProjects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch projects.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function _update<T extends Project>(_id: string, updatedDoc: Partial<T>, items: T[]): [T[], number] {
  const index = items.findIndex((item) => item._id === _id);
  if (index === -1) return [items, 0];

  const { _id: updatedId, ...updatedDocWithoutId } = updatedDoc;

  if (updatedId && updatedId !== _id) {
    console.warn(`You shouldn't update ids, but you were trying to update an item _id (${updatedId}) with:`, _id);
  }

  items[index] = { ...items[index], ...updatedDocWithoutId };
  return [items, 1];
}

async function _updateMany<T extends Project>(docs: UpdateManyDoc<T>[], path: string): Promise<number> {
  if (docs.length === 0) return 0;
  let total = 0;
  let items = await getFromFileAndNormalizeProjects(path);

  for (const { _id, ...doc } of docs) {
    const [updatedItems, updates] = _update(_id, doc as Partial<T>, items);
    items = updatedItems;
    total += updates;
  }

  if (total > 0) {
    const rawText = await fs.readFile(path, 'utf-8').catch(() => '')
    const updatedRawText = convertProjectsToRawText(items);

    if (rawText !== updatedRawText) {
      await fs.writeFile(path, updatedRawText, 'utf-8')
        .catch((err) => {
          console.error('Failed to write projects file', err);
          throw new Error('Failed to write projects file');
        });
    }
  }

  return total;
}

// number
export async function handlePutRequest<T extends Resource>(request: Request): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }

    const _updatedDocs: UpdateManyDoc<T> | UpdateManyDoc<T>[] = await request.json();
    const updatedDocs = Array.isArray(_updatedDocs) ? _updatedDocs : [_updatedDocs];

    const updatedData = await _updateMany(updatedDocs, PROJECTS_PATH)
    await Projects.updateMany(updatedDocs);

    return new Response(JSON.stringify(updatedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating data:', error);
    const response: ErrorResponse = { error: 'Failed to update data.' };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request): Promise<Response> {
  return handlePutRequest(request);
}

export async function handleDeleteRequest<T extends Project>(
  repository: Repository<T>,
  request: Request
): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }
    const ids: string[] = await request.json();
    if (ids.length > 0) {
      await repository.deleteMany(ids);
      const projects = await repository.read();
      const rawText = await fs.readFile(PROJECTS_PATH, 'utf-8').catch(() => '')
      const updatedRawText = convertProjectsToRawText(projects);

      if (rawText !== updatedRawText) {
        await fs.writeFile(PROJECTS_PATH, updatedRawText, 'utf-8')
          .catch((err) => {
            console.error('Failed to write projects file', err);
            throw new Error('Failed to write projects file');
          });
      }
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting data:', error);
    const response: ErrorResponse = { error: 'Failed to delete data.' };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDeleteRequest(Projects, request);
}