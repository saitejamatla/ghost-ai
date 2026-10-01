export interface Project {
  id: string;
  name: string;
  slug: string;
  /** True when the current user owns the project; false for shared/collaborator projects. */
  isOwner: boolean;
}
