"use client";

import { createContext, useContext } from "react";

import type { ProjectDialogsState } from "@/hooks/use-project-dialogs";

export const ProjectDialogsContext = createContext<ProjectDialogsState | null>(null);

export function useProjectDialogsContext(): ProjectDialogsState {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error("useProjectDialogsContext must be used inside EditorShell");
  }
  return context;
}
