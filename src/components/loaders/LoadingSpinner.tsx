import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({ fullScreen = false, className }: LoadingSpinnerProps) {
  return (
    <div className={`flex w-full items-center justify-center ${fullScreen ? 'h-screen' : 'h-[calc(100vh-200px)]'} ${className || ''}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
