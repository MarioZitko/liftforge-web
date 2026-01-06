import { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadableProps {
  fallback?: React.ReactNode;
}

const DefaultSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Loadable = <P extends object>(Component: LazyExoticComponent<ComponentType<P>>, options?: LoadableProps) => {
  return (props: P) => (
    <Suspense fallback={options?.fallback || <DefaultSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

export default Loadable;
