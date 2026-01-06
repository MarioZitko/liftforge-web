import { cn } from '@/lib/utils';
import { ComponentProps, ElementType } from 'react';
import { ITypographyProps } from './types';

function Typography<T extends ElementType = 'p'>({
  className,
  variant = 'p',
  component,
  children,
  ...props
}: ITypographyProps<T> & Omit<ComponentProps<T>, keyof ITypographyProps<T>>) {
  const validElementTypes = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'ul', 'small', 'lead', 'large', 'muted']);
  const Component = (component || (validElementTypes.has(variant) ? variant : 'p')) as ElementType;

  return (
    <Component className={cn(getVariantClasses(variant), className)} {...props}>
      {children}
    </Component>
  );
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'h1':
      return 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';
    case 'h2':
      return 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0';
    case 'h3':
      return 'scroll-m-20 text-2xl font-semibold tracking-tight';
    case 'h4':
      return 'scroll-m-20 text-xl font-semibold tracking-tight';
    case 'p':
      return 'leading-7 [&:not(:first-child)]:mt-6';
    case 'blockquote':
      return 'mt-6 border-l-2 pl-6 italic';
    case 'inlinecode':
      return 'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold';
    case 'ul':
      return 'my-6 ml-6 list-disc [&>li]:mt-2';
    case 'small':
      return 'text-sm font-medium leading-none';
    case 'lead':
      return 'text-xl text-muted-foreground';
    case 'large':
      return 'text-lg font-semibold';
    case 'muted':
      return 'text-sm text-muted-foreground';
    default:
      return 'leading-7 [&:not(:first-child)]:mt-6';
  }
};

export { Typography };
