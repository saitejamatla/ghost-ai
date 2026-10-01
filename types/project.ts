export interface Project {
  /** Also the project's Liveblocks room ID. */
  id: string;
  name: string;
  /** True when the current user owns the project; false for shared/collaborator projects. */
  isOwner: boolean;
}
