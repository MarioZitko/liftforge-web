export interface FileUploadProps {
  handleDrop?: (acceptedFiles: File[], fileRejections: any[], event: any) => void;
  files: File[];
  handleFileDelete?: (file: FileTableData) => void;
  viewOnly?: boolean;
}

// Create a type for the file data with proper typing
export type FileTableData = {
  id: string;
  name: string;
  size: string;
  type: string;
  lastModified: string;
  file: File; // Keep reference to original file for deletion
};

export type UploadedFileTableData = {
  id: string;
  originalName: string;
  storedName: string;
  publicUrlPath: string;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
