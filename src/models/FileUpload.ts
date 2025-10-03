export interface FileUpload {
  fileId: string;         // Primary Key (UUID)
  userId: string;         // GSI Partition Key
  originalName: string;
  fileName: string;
  s3Key: string;
  fileType: 'pdf' | 'csv';
  fileSize?: number;
  uploadedAt: string;
  status: 'pending' | 'uploaded' | 'processed' | 'failed';
  metadata?: {
    contentType: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}
