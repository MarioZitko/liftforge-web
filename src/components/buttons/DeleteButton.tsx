import { IconTrash } from '@tabler/icons-react';
import { Button } from './button';
import { DeleteButtonProps } from './types';

export function DeleteButton({ onDeleteClick }: DeleteButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={(e) => onDeleteClick(e)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
      <IconTrash className="h-4 w-4" />
      <span className="sr-only">Delete item</span>
    </Button>
  );
}
