import { IconPencil } from '@tabler/icons-react';
import { Button } from './button';
import { EditButtonProps } from './types';

export function EditButton({ onEditClick }: EditButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={(e) => onEditClick(e)} className="h-8 w-8 p-0">
      <IconPencil className="h-4 w-4" />
      <span className="sr-only">Edit item</span>
    </Button>
  );
}
