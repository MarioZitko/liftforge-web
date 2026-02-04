import * as React from 'react';

import { Input } from '@/components/input/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, startIcon, endIcon, className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const id = React.useId();
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          {startIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">{startIcon}</div>}

          <Input
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error}
            className={cn(startIcon && 'pl-10', endIcon && 'pr-10', className)}
            {...props}
          />

          {endIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">{endIcon}</div>}

          {label && (
            <Label
              htmlFor={id}
              className={cn(
                'absolute text-xs text-muted-foreground pointer-events-none z-10 transition-all duration-200',
                isFocused ? 'left-0 -top-5 text-primary' : 'left-3 top-0 -translate-y-1/2 bg-background px-1',
                error && (isFocused ? 'text-destructive' : 'text-destructive'),
                props.disabled && 'opacity-50',
                !isFocused && startIcon && 'left-10'
              )}
            >
              {label}
            </Label>
          )}
        </div>

        {helperText && <p className={cn('text-sm text-muted-foreground', error && 'text-destructive')}>{helperText}</p>}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };
