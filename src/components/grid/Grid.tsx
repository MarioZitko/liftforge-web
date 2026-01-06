import { cn } from '@/lib/utils';
import React from 'react';
import { IBreakpoints, IGridContainerProps, IGridItemProps } from './types';

// For GridItem - uses col-span classes (grid columns)
const getResponsiveColSpanClasses = (props: IBreakpoints): string => {
  const classes: string[] = [];

  const addColSpanClass = (size: number, prefix = '') => {
    if (size === undefined) return;
    // Clamp size between 0 and 12
    const clampedSize = Math.max(0, Math.min(12, Math.floor(size)));
    classes.push(`${prefix}col-span-${clampedSize}`);
  };

  // If no breakpoint is specified, default to full width (col-span-12)
  const hasAnySize = props.xs || props.sm || props.md || props.lg || props.xl;
  if (!hasAnySize) {
    classes.push('col-span-12');
  } else {
    // Apply breakpoint-specific column spans
    props.xs && addColSpanClass(props.xs, '');
    props.sm && addColSpanClass(props.sm, 'sm:');
    props.md && addColSpanClass(props.md, 'md:');
    props.lg && addColSpanClass(props.lg, 'lg:');
    props.xl && addColSpanClass(props.xl, 'xl:');
  }

  return classes.join(' ');
};

const getRoundedClass = (rounded: string): string => {
  switch (rounded) {
    case '':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'md':
      return 'rounded-md';
    case 'lg':
      return 'rounded-lg';
    case 'xl':
      return 'rounded-xl';
    default:
      return 'rounded-none';
  }
};

const getFlexClasses = ({
  direction = 'column',
  alignItems,
  justifyContent,
  wrap,
}: {
  direction?: 'row' | 'column';
  alignItems?: string;
  justifyContent?: string;
  wrap?: boolean;
}) => {
  const classes: string[] = ['flex'];

  // Direction
  classes.push(direction === 'row' ? 'flex-row' : 'flex-col');

  // Align items
  if (alignItems) {
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };
    classes.push(alignMap[alignItems as keyof typeof alignMap]);
  }

  // Justify content
  if (justifyContent) {
    const justifyMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };
    classes.push(justifyMap[justifyContent as keyof typeof justifyMap]);
  }

  // Wrap
  if (wrap) {
    classes.push('flex-wrap');
  }

  return classes.join(' ');
};

const GridContainer = React.forwardRef<HTMLDivElement, IGridContainerProps>(
  ({ children, className, rounded = '', border, spacing = 4, padding = 0, margin = 0, xs, sm, md, lg, xl, style, ...props }, ref) => {
    // Calculate margin for CSS custom property
    const totalMargin = margin * 2 * 0.25;

    const gridStyle = {
      gap: `${spacing * 0.25}rem`,
      ...(margin !== 0 && { margin: `${margin * 0.25}rem` }),
      ...(padding !== 0 && { padding: `${padding * 0.25}rem` }),
      '--grid-margin': `${totalMargin}rem`,
      '--width-xs': xs ? `${(xs / 12) * 100}%` : '100%',
      ...(sm && { '--width-sm': `${(sm / 12) * 100}%` }),
      ...(md && { '--width-md': `${(md / 12) * 100}%` }),
      ...(lg && { '--width-lg': `${(lg / 12) * 100}%` }),
      ...(xl && { '--width-xl': `${(xl / 12) * 100}%` }),
      ...style,
    } as React.CSSProperties;

    const dataAttrs = {
      ...(sm && { 'data-width-sm': '' }),
      ...(md && { 'data-width-md': '' }),
      ...(lg && { 'data-width-lg': '' }),
      ...(xl && { 'data-width-xl': '' }),
    };

    return (
      <div
        ref={ref}
        style={gridStyle}
        className={cn(
          'grid grid-cols-12 bg-card text-card-foreground grid-container-responsive',
          getRoundedClass(rounded),
          border && 'border',
          className
        )}
        {...dataAttrs}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const GridItem = React.forwardRef<HTMLDivElement, IGridItemProps>(
  (
    {
      children,
      className,
      xs,
      sm,
      md,
      lg,
      xl,
      rounded = '',
      border,
      spacing = 6,
      padding = 1,
      margin = 0,
      direction = 'column',
      alignItems,
      justifyContent,
      gap,
      wrap = false,
      style,
      ...props
    },
    ref
  ) => {
    const gridItemStyle = {
      ...(margin !== undefined && { margin: `${margin * 0.25}rem` }),
      ...(padding !== undefined && { padding: `${padding * 0.25}rem` }),
      ...style,
    } as React.CSSProperties;

    // Use gap prop if provided, otherwise use spacing for backward compatibility
    const itemGap = gap !== undefined ? `${gap * 0.25}rem` : `${spacing * 0.25}rem`;

    return (
      <div
        ref={ref}
        style={{
          ...gridItemStyle,
          gap: itemGap,
        }}
        className={cn(
          'bg-card text-card-foreground',
          getResponsiveColSpanClasses({ xs, sm, md, lg, xl }),
          getFlexClasses({ direction, alignItems, justifyContent, wrap }),
          getRoundedClass(rounded),
          className,
          border && 'border'
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridContainer.displayName = 'GridContainer';
GridItem.displayName = 'GridItem';

export { GridContainer, GridItem };
