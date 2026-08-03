/**
 * Draft Types (Newsletter Drafts)
 */

export interface Draft {
  id: string;
  admin_id: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDraftRequest {
  subject: string;
  content: string;
}

export interface UpdateDraftRequest {
  subject?: string;
  content?: string;
}

export interface DraftWithAdmin extends Draft {
  admin_email?: string;
}
