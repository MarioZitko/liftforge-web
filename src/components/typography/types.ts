import { ElementType } from 'react';

export interface ITypographyProps<T extends ElementType = ElementType> {
  variant?: string;
  component?: T;
  className?: string;
  children?: React.ReactNode;
}
