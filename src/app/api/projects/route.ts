import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "@/lib/resourceHandlers";
import TextRepository from "@/lib/TextRepository";
import JsonRepository from "@/lib/JsonRepository";
import TextJsonRepository from "@/lib/TextJsonRepository";
import { RAW_PROJECT_REGEX, convertProjectToRawProject, convertRawProjectToProject, textProjectToProject } from "@/utils";

const PROJECTS_PATH = process.env.PROJECTS_PATH;

const createProjectTextJsonRepository = (path: string) => {
  const TextProjects = new TextRepository<Project>(path, {
    resourceRegex: RAW_PROJECT_REGEX,
    parseTextResource: convertRawProjectToProject,
    serializeResource: convertProjectToRawProject,
  });

  const JsonProjects = new JsonRepository<Project>('projects');

  const TextJsonProject = new TextJsonRepository<Project, TextProject>(TextProjects, JsonProjects, {
    expandTextResources: textProjectToProject
  });
  return TextJsonProject;
}

const Projects = createProjectTextJsonRepository(PROJECTS_PATH!);

export async function GET(): Promise<Response> {
  return handleGetRequest(Projects);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostRequest(Projects, request);
}

export async function PUT(request: Request): Promise<Response> {
  return handlePutRequest(Projects, request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDeleteRequest(Projects, request);
}