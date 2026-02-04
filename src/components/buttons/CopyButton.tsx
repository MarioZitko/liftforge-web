import { IconCopy } from '@tabler/icons-react';
import { Button } from './button';
import { CopyButtonProps } from './types';

export default function CopyButton({ onCopyClick }: CopyButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={(e) => onCopyClick(e)} className="h-8 w-8 p-0">
      <IconCopy className="h-4 w-4" />
      <span className="sr-only">Copy items</span>
    </Button>
  );
}
