import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "@/lib/resourceHandlers";
import JsonRepository from "@/lib/JsonRepository";

const Records = new JsonRepository<DoneRecord>('records');

export async function GET(): Promise<Response> {
  return handleGetRequest(Records);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostRequest(Records, request);
}

export async function PUT(request: Request): Promise<Response> {
  return handlePutRequest(Records, request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDeleteRequest(Records, request);
}