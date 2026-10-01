import { EditorHome } from "@/components/editor/editor-home";
import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjects } from "@/lib/project-data";

export default async function EditorPage() {
  const { owned, shared } = await getEditorProjects();

  return (
    <EditorShell ownedProjects={owned} sharedProjects={shared}>
      <EditorHome />
    </EditorShell>
  );
}
