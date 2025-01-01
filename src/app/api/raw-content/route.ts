import { promises as fs } from 'fs';

const PROJECTS_PATH = process.env.PROJECTS_PATH;

export async function GET(): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }

    const fileContent = await fs.readFile(PROJECTS_PATH, 'utf-8')
      .catch((err) => {
        if (err.code !== 'ENOENT') console.error('Error ENOENT reading projects file:', err);
        else console.error('Error reading projects file:', err);
        return '';
      })

    return new Response(JSON.stringify(fileContent), {
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

export async function POST(request: Request): Promise<Response> {
  try {
    if (!PROJECTS_PATH) {
      throw new Error('PROJECTS_PATH environment variable is not set');
    }

    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await fs.writeFile(PROJECTS_PATH, text, 'utf-8');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return new Response(JSON.stringify({ error: 'Failed to update projects.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
