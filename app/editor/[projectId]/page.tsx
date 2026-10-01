import { notFound } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjects } from "@/lib/project-data";

// Placeholder workspace: the canvas is not specified yet.
export default async function WorkspacePage({
  params,
}: PageProps<"/editor/[projectId]">) {
  const { projectId } = await params;
  const { owned, shared } = await getEditorProjects();

  // Only owners and collaborators can open a workspace.
  const project = [...owned, ...shared].find((p) => p.id === projectId);
  if (!project) notFound();

  return (
    <EditorShell ownedProjects={owned} sharedProjects={shared}>
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-2xl font-semibold text-copy-primary">
          {project.name}
        </h1>
        <p className="font-mono text-xs text-copy-muted">{project.id}</p>
      </div>
    </EditorShell>
  );
}
