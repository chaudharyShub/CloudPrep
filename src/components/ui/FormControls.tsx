import { useId, type ComponentProps, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const controlBase =
  'w-full rounded-sm border border-border-control bg-surface-2 text-sm text-fg ' +
  'transition-colors placeholder:text-fg-subtle hover:border-fg-subtle ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger';

export function TextInput({ className, ...rest }: ComponentProps<'input'>) {
  return <input type="text" className={cn(controlBase, 'h-10 px-3', className)} {...rest} />;
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> extends Omit<
  ComponentProps<'select'>,
  'value' | 'onChange' | 'children'
> {
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
}

/** Native <select>, styled. Keeps full keyboard and screen-reader support. */
export function Select<T extends string>({
  value,
  options,
  onValueChange,
  className,
  ...rest
}: SelectProps<T>) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) onValueChange(next.value);
        }}
        className={cn(controlBase, 'h-10 appearance-none pr-9 pl-3')}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}

export interface FieldProps {
  label: string;
  description?: ReactNode;
  error?: string | undefined;
  /** Render prop receives the ids needed to wire up the control. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

/** Label + description + error wrapper for a single form control. */
export function Field({ label, description, error, children, className }: FieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {description && (
        <p id={descriptionId} className="text-sm text-fg-muted">
          {description}
        </p>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SwitchProps {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** A native checkbox exposed as role="switch", so Space toggles it as screen readers expect. */
export function Switch({ label, description, checked, onCheckedChange, disabled }: SwitchProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
            {description}
          </p>
        )}
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          onChange={(event) => {
            onCheckedChange(event.target.checked);
          }}
          className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
            'peer-disabled:opacity-50',
            checked ? 'border-accent bg-accent' : 'border-border-control bg-surface-3',
          )}
        >
          <span
            className={cn(
              'size-4.5 rounded-full transition-transform',
              checked ? 'translate-x-5 bg-on-accent' : 'translate-x-0 bg-fg-muted',
            )}
          />
        </span>
      </span>
    </div>
  );
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  description?: ReactNode;
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
  /** Visually hide the legend while keeping it as the group's accessible name. */
  hideLabel?: boolean;
}

/** A radio group styled as a segmented control. Arrow keys move between options natively. */
export function SegmentedControl<T extends string>({
  label,
  description,
  value,
  options,
  onValueChange,
  hideLabel = false,
}: SegmentedControlProps<T>) {
  const name = useId();
  const descriptionId = `${name}-description`;
  return (
    <fieldset aria-describedby={description ? descriptionId : undefined} className="min-w-0">
      <legend className={cn('mb-1.5 text-sm font-medium text-fg', hideLabel && 'sr-only')}>
        {label}
      </legend>
      {description && (
        <p id={descriptionId} className="mb-2 text-sm text-fg-muted">
          {description}
        </p>
      )}
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-md border border-border-control bg-surface-2 p-1">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <div key={option.value} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => {
                  onValueChange(option.value);
                }}
                className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
              />
              <label
                htmlFor={id}
                className={cn(
                  'pointer-events-none flex h-8 items-center rounded-sm px-3 text-sm font-medium whitespace-nowrap transition-colors',
                  'text-fg-muted peer-hover:text-fg',
                  'peer-checked:bg-surface-3 peer-checked:text-fg peer-checked:shadow-[inset_0_0_0_1px_var(--cp-border-strong)]',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
