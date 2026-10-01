 import { prisma } from "@/lib/prisma";

export type ProjectOwnership = "owner" | "forbidden" | "not-found";

/** Resolves whether `userId` owns the project. Call before any mutation. */
export async function checkProjectOwnership(
  projectId: string,
  userId: string,
): Promise<ProjectOwnership> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return "not-found";
  return project.ownerId === userId ? "owner" : "forbidden";
}
