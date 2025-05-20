export interface DocumentComment {
  date: string;
  text: string;
  author: string;
}

export interface Document {
  id: string;
  documentType: string;
  submittedDate: string;
  status: DocumentStatus;
  description: string;
  relatedTo: string;
  fileSize: string;
  fileType: string;
  comments: DocumentComment[];
}

export type DocumentStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Needs Revision'
  | 'In Progress'
  | 'Verified'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export interface TrackingResult {
  status: string;
  location: string;
  lastUpdate: string;
  estimatedCompletion: string;
}