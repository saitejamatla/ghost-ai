"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  ProjectDialogsState,
  ProjectDialogType,
} from "@/hooks/use-project-dialogs";
import { slugify } from "@/lib/slug";

interface ProjectDialogsProps {
  dialogs: ProjectDialogsState;
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { targetProject, name, setName } = dialogs;
  const slug = slugify(name);

  return (
    <>
      <ProjectDialog
        type="create"
        dialogs={dialogs}
        title="Create project"
        description="Name your new architecture workspace."
        submitLabel="Create project"
      >
        <div className="space-y-2">
          <Input
            aria-label="Project name"
            placeholder="e.g. Payments Platform"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="text-xs text-copy-muted">
            Slug:{" "}
            <span className="font-mono text-copy-secondary">
              {slug || "your-project-name"}
            </span>
          </p>
        </div>
      </ProjectDialog>

      <ProjectDialog
        type="rename"
        dialogs={dialogs}
        title="Rename project"
        description={
          <>
            Enter a new name for{" "}
            <span className="font-medium text-copy-primary">
              {targetProject?.name}
            </span>
            .
          </>
        }
        submitLabel="Rename"
        initialFocus={renameInputRef}
      >
        <Input
          ref={renameInputRef}
          aria-label="Project name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </ProjectDialog>

      <ProjectDialog
        type="delete"
        dialogs={dialogs}
        title="Delete project"
        description={
          <>
            <span className="font-medium text-copy-primary">
              {targetProject?.name}
            </span>{" "}
            will be permanently deleted. This action cannot be undone.
          </>
        }
        submitLabel="Delete"
        destructive
      />
    </>
  );
}

interface ProjectDialogProps {
  type: ProjectDialogType;
  dialogs: ProjectDialogsState;
  title: string;
  description: ReactNode;
  submitLabel: string;
  destructive?: boolean;
  initialFocus?: RefObject<HTMLInputElement | null>;
  children?: ReactNode;
}

function ProjectDialog({
  type,
  dialogs,
  title,
  description,
  submitLabel,
  destructive = false,
  initialFocus,
  children,
}: ProjectDialogProps) {
  const { activeDialog, isSubmitting, canSubmit, close, submit } = dialogs;

  return (
    <Dialog
      open={activeDialog === type}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="overflow-hidden rounded-3xl sm:max-w-md"
        initialFocus={initialFocus}
      >
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={isSubmitting}
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={!canSubmit}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
