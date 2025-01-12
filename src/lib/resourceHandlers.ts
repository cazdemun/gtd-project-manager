class SuccessResponse extends Response {
  constructor(body: string, status: number) {
    super(body, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

class ErrorResponse extends Response {
  constructor(message: string) {
    const body = JSON.stringify({ error: message });
    super(body, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// T[]
export async function handleGetRequest<T extends Resource>(repository: Repository<T>): Promise<Response> {
  try {
    const body = await repository.read() as T[];
    return new SuccessResponse(JSON.stringify(body), 200);
  } catch (error) {
    console.error('Error reading data:', error);
    return new ErrorResponse('Failed to fetch data.');
  }
}

// T[]
export async function handlePostRequest<T extends Resource>(
  repository: Repository<T>,
  request: Request
): Promise<Response> {
  try {
    const body = await request.json() as NewResource<T> | NewResource<T>[];
    const newDocs = Array.isArray(body) ? body : [body];
    const newData = await repository.create(newDocs);
    return new SuccessResponse(JSON.stringify(newData), 201);
  } catch (error) {
    console.error('Error creating data:', error);
    return new ErrorResponse('Failed to create data.');
  }
}

// number
export async function handlePutRequest<T extends Resource>(
  repository: Repository<T>,
  request: Request
): Promise<Response> {
  try {
    const body = await request.json() as UpdatableResource<T> | UpdatableResource<T>[];
    const updatedDocs = Array.isArray(body) ? body : [body];
    const updatedData = await repository.updateMany(updatedDocs);
    return new SuccessResponse(JSON.stringify(updatedData), 200);
  } catch (error) {
    console.error('Error updating data:', error);
    return new ErrorResponse('Failed to update data.');
  }
}

// void
export async function handleDeleteRequest<T extends Resource>(
  repository: Repository<T>,
  request: Request
): Promise<Response> {
  try {
    const ids = await request.json() as string[];
    await repository.deleteMany(ids);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting data:', error);
    return new ErrorResponse('Failed to delete data.');
  }
}

// Example usage:

// /route.ts
// import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "@/lib/resourceHandlers";

// const Projects = new Repository<Project>('projects');

// export async function GET(): Promise<Response> {
//   return handleGetRequest(Projects);
// }

// export async function POST(request: Request): Promise<Response> {
//   return handlePostRequest(Projects, request);
// }

// export async function PUT(request: Request): Promise<Response> {
//   return handlePutRequest(Projects, request);
// }

// export async function DELETE(request: Request): Promise<Response> {
//   return handleDeleteRequest(Projects, request);
// }