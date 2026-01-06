import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
});
Box.displayName = 'Box';

export { Box };
