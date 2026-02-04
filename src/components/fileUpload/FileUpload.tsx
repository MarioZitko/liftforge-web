import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../dataTable/DataTable';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from './dropzone';
import { FileTableData, FileUploadProps, formatFileSize } from './types';

const fileColumns: ColumnDef<FileTableData>[] = [
  {
    accessorKey: 'name',
    header: 'File Name',
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: 'lastModified',
    header: 'Last Modified',
    cell: ({ getValue }) => getValue() as string,
  },
];

export default function FileUpload({ handleDrop, files, handleFileDelete, viewOnly }: FileUploadProps) {
  // Transform files to table data
  const fileTableData: FileTableData[] = files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || 'Unknown',
    lastModified: new Date(file.lastModified).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    file,
  }));
  return (
    <>
      {!viewOnly && (
        <Dropzone maxFiles={5} maxSize={1024 * 1024 * 10} minSize={1024} onDrop={handleDrop} onError={console.error} src={files}>
          <DropzoneEmptyState />
          <DropzoneContent showFileCount={true} />
        </Dropzone>
      )}

      {files.length > 0 && (
        <DataTable paginationEnabled={false} data={fileTableData} columns={fileColumns} onDeleteClick={handleFileDelete} />
      )}
    </>
  );
}
