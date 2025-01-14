import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "@/lib/resourceHandlers";
import JsonRepository from "@/lib/JsonRepository";

const Sources = new JsonRepository<Source>('sources');

export async function GET(): Promise<Response> {
  return handleGetRequest(Sources);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostRequest(Sources, request);
}

export async function PUT(request: Request): Promise<Response> {
  return handlePutRequest(Sources, request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDeleteRequest(Sources, request);
}