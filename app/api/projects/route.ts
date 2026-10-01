import { auth } from "@clerk/nextjs/server";

import { badRequest, conflict, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseCreateProjectInput, readJsonObject } from "@/lib/project-input";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const input = parseCreateProjectInput(body.value);
  if (!input.ok) return badRequest(input.error);

  try {
    const project = await prisma.project.create({
      data: { ownerId: userId, name: input.value.name, id: input.value.id },
    });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("A project with this ID already exists");
    }
    throw error;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
