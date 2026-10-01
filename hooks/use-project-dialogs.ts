"use client";

import { useState, type FormEvent } from "react";

import type { Project } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete";

interface ProjectDialogHandlers {
  onCreate: (name: string) => void | Promise<void>;
  onRename: (project: Project, name: string) => void | Promise<void>;
  onDelete: (project: Project) => void | Promise<void>;
}

export function useProjectDialogs(handlers: ProjectDialogHandlers) {
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType | null>(null);
  // Kept after close so dialog text doesn't blank out during the exit animation.
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setName("");
    setActiveDialog("create");
  }

  function openRename(project: Project) {
    setTargetProject(project);
    setName(project.name);
    setActiveDialog("rename");
  }

  function openDelete(project: Project) {
    setTargetProject(project);
    setActiveDialog("delete");
  }

  function close() {
    if (isSubmitting) return;
    setActiveDialog(null);
  }

  const trimmedName = name.trim();
  const canSubmit =
    !isSubmitting &&
    (activeDialog === "delete" ||
      (activeDialog === "create" && trimmedName.length > 0) ||
      (activeDialog === "rename" &&
        trimmedName.length > 0 &&
        trimmedName !== targetProject?.name));

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      if (activeDialog === "create") await handlers.onCreate(trimmedName);
      if (activeDialog === "rename" && targetProject)
        await handlers.onRename(targetProject, trimmedName);
      if (activeDialog === "delete" && targetProject)
        await handlers.onDelete(targetProject);
      setActiveDialog(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    activeDialog,
    targetProject,
    name,
    setName,
    isSubmitting,
    canSubmit,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}

export type ProjectDialogsState = ReturnType<typeof useProjectDialogs>;
