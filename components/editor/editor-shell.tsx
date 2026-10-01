"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import { ProjectsSidebar } from "@/components/editor/projects-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { createMockProject, MOCK_PROJECTS } from "@/lib/mock-projects";
import { slugify } from "@/lib/slug";

interface EditorShellProps {
  children: ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // In-memory mock data only; resets on reload until projects have an API.
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  const dialogs = useProjectDialogs({
    onCreate: (name) =>
      setProjects((current) => [...current, createMockProject(name)]),
    onRename: (project, name) =>
      setProjects((current) =>
        current.map((p) =>
          p.id === project.id ? { ...p, name, slug: slugify(name) } : p
        )
      ),
    onDelete: (project) =>
      setProjects((current) => current.filter((p) => p.id !== project.id)),
  });

  return (
    <ProjectDialogsContext value={dialogs}>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <ProjectsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          onCreate={dialogs.openCreate}
          onRename={dialogs.openRename}
          onDelete={dialogs.openDelete}
        />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
      <ProjectDialogs dialogs={dialogs} />
    </ProjectDialogsContext>
  );
}
