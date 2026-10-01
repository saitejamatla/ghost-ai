import { auth } from "@clerk/nextjs/server";

import {
  badRequest,
  forbidden,
  notFound,
  unauthorized,
} from "@/lib/api-response";
import { checkProjectOwnership } from "@/lib/project-access";
import { parseRenameProjectInput, readJsonObject } from "@/lib/project-input";
import { prisma } from "@/lib/prisma";

type Context = RouteContext<"/api/projects/[projectId]">;

export async function PATCH(request: Request, ctx: Context) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { projectId } = await ctx.params;

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const input = parseRenameProjectInput(body.value);
  if (!input.ok) return badRequest(input.error);

  const ownership = await checkProjectOwnership(projectId, userId);
  if (ownership === "not-found") return notFound();
  if (ownership === "forbidden") return forbidden();

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: input.value.name },
  });

  return Response.json({ project });
}

export async function DELETE(_request: Request, ctx: Context) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { projectId } = await ctx.params;

  const ownership = await checkProjectOwnership(projectId, userId);
  if (ownership === "not-found") return notFound();
  if (ownership === "forbidden") return forbidden();

  const project = await prisma.project.delete({ where: { id: projectId } });

  return Response.json({ project });
}
