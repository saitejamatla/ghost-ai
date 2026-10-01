"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import { createProjectId, generateProjectIdSuffix } from "@/lib/project-id";
import type { Project } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete";

interface RenameTarget {
  id: string;
  name: string;
}

interface ProjectResponse {
  project: { id: string; name: string };
}

export function useProjectActions() {
  const router = useRouter();
  const { projectId: activeProjectId } = useParams<{ projectId?: string }>();

  const [activeDialog, setActiveDialog] = useState<ProjectDialogType | null>(null);
  const [name, setName] = useState("");
  const [idSuffix, setIdSuffix] = useState("");
  // Targets are kept after close so dialog text doesn't blank out during the exit animation.
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  // Shown in the create dialog and sent as the project ID, so preview and record match.
  const roomId = createProjectId(trimmedName, idSuffix);

  function open(dialog: ProjectDialogType) {
    setError(null);
    setActiveDialog(dialog);
  }

  function openCreate() {
    setName("");
    setIdSuffix(generateProjectIdSuffix());
    open("create");
  }

  function openRename(project: Project) {
    setRenameTarget({ id: project.id, name: project.name });
    setName(project.name);
    open("rename");
  }

  function openDelete(project: Project) {
    setDeleteTarget(project);
    open("delete");
  }

  function close() {
    if (isSubmitting) return;
    setActiveDialog(null);
  }

  const canSubmit =
    !isSubmitting &&
    (activeDialog === "delete" ||
      (activeDialog === "create" && trimmedName.length > 0) ||
      (activeDialog === "rename" &&
        trimmedName.length > 0 &&
        trimmedName !== renameTarget?.name));

  async function createProject() {
    const { project } = await requestProject("/api/projects", "POST", {
      id: roomId,
      name: trimmedName,
    });
    router.push(`/editor/${project.id}`);
  }

  async function renameProject(target: RenameTarget) {
    await requestProject(`/api/projects/${target.id}`, "PATCH", {
      name: trimmedName,
    });
    router.refresh();
  }

  async function deleteProject(target: Project) {
    await requestProject(`/api/projects/${target.id}`, "DELETE");
    if (target.id === activeProjectId) {
      router.replace("/editor");
    } else {
      router.refresh();
    }
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (activeDialog === "create") await createProject();
      if (activeDialog === "rename" && renameTarget) await renameProject(renameTarget);
      if (activeDialog === "delete" && deleteTarget) await deleteProject(deleteTarget);
      setActiveDialog(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      // A fresh suffix lets a retry succeed after an ID collision.
      if (activeDialog === "create") setIdSuffix(generateProjectIdSuffix());
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    activeDialog,
    name,
    setName,
    roomId,
    renameTarget,
    deleteTarget,
    isSubmitting,
    error,
    canSubmit,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}

export type ProjectActions = ReturnType<typeof useProjectActions>;

async function requestProject(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, string>,
): Promise<ProjectResponse> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String(data.error)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as ProjectResponse;
}
