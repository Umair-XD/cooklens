'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  emptyText = 'No items found.',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const updateDropdownPosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 4;
    const searchHeight = 45;
    const preferredListHeight = Math.min(300, Math.max(180, options.length * 36));
    const preferredHeight = searchHeight + preferredListHeight;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const spaceAbove = rect.top - viewportPadding - gap;
    const openAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      160,
      Math.min(preferredHeight, openAbove ? spaceAbove : spaceBelow),
    );

    setDropdownStyle({
      left: Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - rect.width - viewportPadding,
      ),
      top: openAbove ? rect.top - availableHeight - gap : rect.bottom + gap,
      width: Math.min(rect.width, window.innerWidth - viewportPadding * 2),
      maxHeight: availableHeight,
      ['--multiselect-list-height' as string]: `${Math.max(96, availableHeight - searchHeight)}px`,
    });
  }, [options.length]);

  // Same pattern as UserNav — guaranteed to work
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open, updateDropdownPosition]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value],
    );
  };

  const remove = (value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger — styled like SelectTrigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateDropdownPosition();
          setOpen((v) => !v);
        }}
        className={cn(
          'flex min-h-11 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          !selected.length && 'text-muted-foreground',
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0 text-left">
          {selectedOptions.length === 0
            ? <span>{placeholder}</span>
            : selectedOptions.map((opt) => (
                <Badge key={opt.value} variant="secondary" className="rounded-md font-medium text-xs h-5">
                  {opt.label}
                  <span
                    role="button"
                    aria-label={`Remove ${opt.label}`}
                    className="ml-1 opacity-60 hover:opacity-100"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => remove(opt.value, e)}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
          }
        </div>
        <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {/* Dropdown — styled like SelectContent, uses Command for search + list */}
      {open && dropdownStyle && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="fixed z-[200] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-[var(--multiselect-list-height)]">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label]}
                      onSelect={() => toggle(option.value)}
                    >
                      <span className="mr-2 flex h-3.5 w-3.5 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4" />}
                      </span>
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>,
        document.body,
      )}
    </div>
  );
}
