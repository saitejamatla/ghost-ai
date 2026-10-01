import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Project } from "@/types/project";

export interface EditorProjects {
  owned: Project[];
  shared: Project[];
}

/**
 * Server-only: projects the signed-in user owns, and projects shared with
 * them (a collaborator row matches one of their Clerk email addresses).
 */
export async function getEditorProjects(): Promise<EditorProjects> {
  const { userId } = await auth.protect();
  const user = await currentUser();
  const emails = user?.emailAddresses.map((entry) => entry.emailAddress) ?? [];

  const select = { id: true, name: true } as const;
  const orderBy = { createdAt: "desc" } as const;

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId }, select, orderBy }),
    emails.length === 0
      ? []
      : prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: { email: { in: emails, mode: "insensitive" } },
            },
          },
          select,
          orderBy,
        }),
  ]);

  return {
    owned: owned.map((project) => ({ ...project, isOwner: true })),
    shared: shared.map((project) => ({ ...project, isOwner: false })),
  };
}
