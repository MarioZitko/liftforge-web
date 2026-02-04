import { IconPlus } from '@tabler/icons-react';
import { Button } from './button';
import { AddButtonProps } from './types';

export default function AddButton({ onAddClick }: AddButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={(e) => onAddClick(e)} className="h-8 w-8 p-0">
      <IconPlus className="h-4 w-4" />
      <span className="sr-only">Add item</span>
    </Button>
  );
}
