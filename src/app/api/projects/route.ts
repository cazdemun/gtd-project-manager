import { convertProjectsToRawText, convertRawProjectToProject, getRawProjects, insertIdentifierToRawProject } from '@/utils';
import { promises as fs } from 'fs';

const PROJECTS_PATH = process.env.PROJECTS_PATH;

// type Project = {
//   _id: string;
//   rawText: string;
//   tags: string[];
//   title: string;
//   description: string;
// }

export async function GET(): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }

    // We query the raw text and make sure they are formatted correctly before sending them back
    const rawText = await fs.readFile(PROJECTS_PATH, 'utf-8')
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
      await fs.writeFile(PROJECTS_PATH, updatedRawText, 'utf-8')
        .catch((err) => {
          console.error('Failed to write projects file', err);
          throw new Error('Failed to write projects file');
        });
    } else {
      console.log('Projects file is up to date');
    }

    return new Response(JSON.stringify(projects), {
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

// export async function POST(request: Request): Promise<Response> {
//   try {
//     if (!PROJECTS_PATH) {
//       throw new Error('PROJECTS_PATH environment variable is not set');
//     }

//     const { text } = await request.json();

//     if (!text) {
//       return new Response(JSON.stringify({ error: 'No text provided.' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     await fs.writeFile(PROJECTS_PATH, text, 'utf-8');

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error in /api/projects:', error);
//     return new Response(JSON.stringify({ error: 'Failed to update projects.' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
