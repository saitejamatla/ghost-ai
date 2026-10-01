"use client";

import { createContext, useContext } from "react";

import type { ProjectActions } from "@/hooks/use-project-actions";

export const ProjectActionsContext = createContext<ProjectActions | null>(null);

export function useProjectActionsContext(): ProjectActions {
  const context = useContext(ProjectActionsContext);
  if (!context) {
    throw new Error("useProjectActionsContext must be used inside EditorShell");
  }
  return context;
}
