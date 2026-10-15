export type SubmissionKind = 'fragment' | 'participa';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type Submission = {
  id: string;
  kind: SubmissionKind;
  name: string | null;
  contact: string | null;
  topic: string | null;
  body: string;
  status: SubmissionStatus;
  created_at: string;
};