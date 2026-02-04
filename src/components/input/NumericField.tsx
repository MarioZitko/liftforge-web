import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { Input } from '@/components/input/input';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/input/input-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumericFieldProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  className?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  // Adornments using existing input-group pattern
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  // react-number-format specific props
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const NumericField = React.forwardRef<HTMLInputElement, NumericFieldProps>(
  ({ label, helperText, error, className, value, onChange, startAdornment, endAdornment, onFocus, onBlur, ...props }, ref) => {
    const id = React.useId();
    const [isFocused, setIsFocused] = React.useState(false);
    const hasAdornments = startAdornment || endAdornment;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const numericInput = (
      <NumericFormat
        {...props}
        getInputRef={ref}
        customInput={hasAdornments ? InputGroupInput : Input}
        id={id}
        value={value}
        aria-invalid={error}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onValueChange={(values) => {
          onChange?.(values.floatValue);
        }}
      />
    );

    return (
      <div className={cn('space-y-2', className)}>
        <div className="relative">
          {hasAdornments ? (
            <InputGroup>
              {startAdornment && (
                <InputGroupAddon align="inline-start">
                  <InputGroupText>{startAdornment}</InputGroupText>
                </InputGroupAddon>
              )}
              {numericInput}
              {endAdornment && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{endAdornment}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>
          ) : (
            numericInput
          )}

          {label && (
            <Label
              htmlFor={id}
              className={cn(
                'absolute text-xs text-muted-foreground pointer-events-none z-10 transition-all duration-200',
                isFocused ? 'left-0 -top-5 text-primary' : 'left-3 top-0 -translate-y-1/2 bg-background px-1',
                error && (isFocused ? 'text-destructive' : 'text-destructive'),
                props.disabled && 'opacity-50',
                !isFocused && startAdornment && 'left-6'
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

NumericField.displayName = 'NumericField';

export { NumericField };
