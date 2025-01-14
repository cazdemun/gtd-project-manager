import fs from 'fs/promises';
import { ErrorResponse, handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "@/lib/resourceHandlers";
import TextRepository from "@/lib/TextRepository";
import JsonRepository from "@/lib/JsonRepository";
import TextJsonRepository from "@/lib/TextJsonRepository";
import { RAW_PROJECT_REGEX, convertProjectToRawProject, convertRawProjectToProject, textProjectToProject } from "@/utils";
import path from "path";

// const PROJECTS_PATH = process.env.PROJECTS_PATH;

const createProjectTextJsonRepository = (path: string, collection: string) => {
  const TextProjects = new TextRepository<Project>(path, {
    resourceRegex: RAW_PROJECT_REGEX,
    parseTextResource: convertRawProjectToProject,
    serializeResource: convertProjectToRawProject,
  });

  const JsonProjects = new JsonRepository<Project>(collection);

  const TextJsonProject = new TextJsonRepository<Project, TextProject>(TextProjects, JsonProjects, {
    expandTextResources: textProjectToProject
  });
  return TextJsonProject;
}

// const Projects = createProjectTextJsonRepository(PROJECTS_PATH!, 'projects');

async function validateSource(source: Source | undefined): Promise<boolean> {
  if (!source) {
    console.log('No source found');
    return false;
  }

  const filePath = source.path;
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension !== '.txt' && fileExtension !== '.md') {
    console.log('Source path is not a valid text or markdown file');
    return false;
  }

  try {
    await fs.access(filePath);
  } catch {
    console.log('Source path is not valid');
    return false;
  }

  return true;
}

const Sources = new JsonRepository<Source>('sources');

const createCurrentProjectTextJsonRepository = async (): Promise<TextJsonRepository<Project, TextProject> | undefined> => {
  try {
    const sources = await Sources.read({ selected: true });
    const source = sources.at(0);
    const isValidSource = await validateSource(source);

    if (!isValidSource) {
      console.info('No selected source found');
      return undefined
    }

    const doFilePath = source!.path;
    const collection = `${source!.slug}-projects`;
    const Projects = createProjectTextJsonRepository(doFilePath, collection);

    return Projects;
  } catch (error) {
    console.error('Error creating repository', error);
    return undefined;
  }
}

export async function GET(): Promise<Response> {
  const Projects = await createCurrentProjectTextJsonRepository();
  if (!Projects) return new ErrorResponse('Failed to fetch repository.');
  return handleGetRequest(Projects);
}

export async function POST(request: Request): Promise<Response> {
  const Projects = await createCurrentProjectTextJsonRepository();
  if (!Projects) return new ErrorResponse('Failed to fetch repository.');
  return handlePostRequest(Projects, request);
}

export async function PUT(request: Request): Promise<Response> {
  const Projects = await createCurrentProjectTextJsonRepository();
  if (!Projects) return new ErrorResponse('Failed to fetch repository.');
  return handlePutRequest(Projects, request);
}

export async function DELETE(request: Request): Promise<Response> {
  const Projects = await createCurrentProjectTextJsonRepository();
  if (!Projects) return new ErrorResponse('Failed to fetch repository.');
  return handleDeleteRequest(Projects, request);
}