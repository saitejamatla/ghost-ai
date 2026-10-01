export interface ApiError {
  error: string;
}

export function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message } satisfies ApiError, { status });
}

export const unauthorized = () => errorResponse(401, "Unauthorized");
export const forbidden = () => errorResponse(403, "Forbidden");
export const notFound = () => errorResponse(404, "Project not found");
export const conflict = (message: string) => errorResponse(409, message);
export const badRequest = (message: string) => errorResponse(400, message);
