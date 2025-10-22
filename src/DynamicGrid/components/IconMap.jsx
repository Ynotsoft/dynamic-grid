// Centralised icon map for Grid actions (Radix-first, with a few aliases).
// Keep names short & backend-friendly: "edit", "view", "delete", etc.

import {
  Pencil1Icon,
  EyeOpenIcon,
  TrashIcon,
  Link2Icon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  GearIcon,
  PersonIcon,
  DownloadIcon,
  UploadIcon,
  ArchiveIcon,
  CopyIcon,
  ClipboardCopyIcon,
  Share1Icon,
  ReloadIcon,
  CheckIcon,
  Cross2Icon,
  LockClosedIcon,
  LockOpen1Icon,
  MagnifyingGlassIcon,
  FileTextIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  StarIcon,
} from "@radix-ui/react-icons";

// can add lucide-react fallbacks if you want broader coverage.
// import { Pencil, Eye, Trash2, ExternalLink, Settings, User } from "lucide-react";

export const ACTION_ICON_MAP = {
  // core
  edit: Pencil1Icon,
  view: EyeOpenIcon,
  delete: TrashIcon,
  more: DotsVerticalIcon,
  menu: DotsHorizontalIcon,
  settings: GearIcon,
  user: PersonIcon,

  // content / io
  download: DownloadIcon,
  upload: UploadIcon,
  archive: ArchiveIcon,
  copy: CopyIcon,
  duplicate: ClipboardCopyIcon,
  share: Share1Icon,
  refresh: ReloadIcon,
  open: Link2Icon,
  details: FileTextIcon,

  // states
  approve: CheckIcon,
  success: CheckIcon,
  error: Cross2Icon,
  reject: Cross2Icon,
  lock: LockClosedIcon,
  unlock: LockOpen1Icon,

  // misc
  search: MagnifyingGlassIcon,
  bookmark: BookmarkIcon,
  comment: ChatBubbleIcon,
  star: StarIcon,
};

// Helper to resolve icon safely; returns null if not found.
export function getActionIcon(key) {
  if (!key) return null;
  const k = String(key).toLowerCase().trim();
  return ACTION_ICON_MAP[k] || null;
}
