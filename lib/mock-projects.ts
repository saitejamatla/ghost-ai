import { slugify } from "@/lib/slug";
import type { Project } from "@/types/project";

// Placeholder data until projects are backed by the database.
export const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Payments Platform", slug: "payments-platform", isOwner: true },
  { id: "p2", name: "Realtime Chat Service", slug: "realtime-chat-service", isOwner: true },
  { id: "p3", name: "Analytics Pipeline", slug: "analytics-pipeline", isOwner: false },
  { id: "p4", name: "Auth Gateway", slug: "auth-gateway", isOwner: false },
];

export function createMockProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    slug: slugify(name),
    isOwner: true,
  };
}
