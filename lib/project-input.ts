import { isValidProjectId } from "@/lib/project-id";

export const DEFAULT_PROJECT_NAME = "Untitled Project";

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Reads a JSON object body. An empty body is treated as `{}`. */
export async function readJsonObject(
  request: Request,
): Promise<ParseResult<Record<string, unknown>>> {
  const text = await request.text();
  if (!text.trim()) return { ok: true, value: {} };

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, error: "Request body must be valid JSON" };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  return { ok: true, value: body as Record<string, unknown> };
}

interface CreateProjectInput {
  name: string;
  /** Client-generated room-aligned ID; omitted → the schema's `cuid()` default. */
  id?: string;
}

/**
 * Create: `name` is optional; missing or blank falls back to the default.
 * `id` is optional and must be a lowercase slug (see `lib/project-id.ts`).
 */
export function parseCreateProjectInput(
  body: Record<string, unknown>,
): ParseResult<CreateProjectInput> {
  const { name, id } = body;

  if (name !== undefined && name !== null && typeof name !== "string") {
    return { ok: false, error: "`name` must be a string" };
  }
  if (id !== undefined && (typeof id !== "string" || !isValidProjectId(id))) {
    return { ok: false, error: "`id` must be a lowercase slug" };
  }

  return {
    ok: true,
    value: { name: name?.trim() || DEFAULT_PROJECT_NAME, id },
  };
}

/** Rename: `name` is required and must not be blank. */
export function parseRenameProjectInput(
  body: Record<string, unknown>,
): ParseResult<{ name: string }> {
  const { name } = body;
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "`name` is required" };
  }
  return { ok: true, value: { name: name.trim() } };
}
