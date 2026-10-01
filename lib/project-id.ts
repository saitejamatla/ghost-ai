import { slugify } from "@/lib/slug";

// Project IDs double as Liveblocks room IDs: `<slug>-<suffix>`.
const SLUG_MAX_LENGTH = 48;
const SUFFIX_LENGTH = 6;
const FALLBACK_SLUG = "untitled-project";
const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_ID_MAX_LENGTH = 64;

/** Short random lowercase base-36 suffix that keeps same-named projects unique. */
export function generateProjectIdSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SUFFIX_LENGTH));
  return Array.from(bytes, (byte) => (byte % 36).toString(36)).join("");
}

export function createProjectId(name: string, suffix: string): string {
  const slug =
    slugify(name).slice(0, SLUG_MAX_LENGTH).replace(/-+$/, "") || FALLBACK_SLUG;
  return `${slug}-${suffix}`;
}

export function isValidProjectId(id: string): boolean {
  return id.length <= PROJECT_ID_MAX_LENGTH && PROJECT_ID_PATTERN.test(id);
}
