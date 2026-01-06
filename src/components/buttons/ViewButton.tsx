import { IconEye } from '@tabler/icons-react';
import { Button } from './button';
import { ViewButtonProps } from './types';

export function ViewButton({ onViewClick }: ViewButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={(e) => onViewClick(e)} className="h-8 w-8 p-0">
      <IconEye className="h-4 w-4" />
      <span className="sr-only">View item</span>
    </Button>
  );
}
