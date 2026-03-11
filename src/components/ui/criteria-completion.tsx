import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

export interface CompletionOption {
  value: string;
  label: string;
  group?: string;
}

interface CriteriaCompletionProps {
  options: CompletionOption[];
  value: string;
  onSelect: (option: CompletionOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CriteriaCompletion: React.FC<CriteriaCompletionProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Rechercher un critère...',
  className,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.children[highlightIndex] as HTMLElement;
      highlighted?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, open]);

  const handleSelect = (option: CompletionOption) => {
    onSelect(option);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIndex]) {
          handleSelect(filtered[highlightIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  const grouped = filtered.reduce<Record<string, CompletionOption[]>>((acc, opt) => {
    const g = opt.group || '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(opt);
    return acc;
  }, {});

  const hasGroups = Object.keys(grouped).some((g) => g !== '');
  let flatIndex = 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      {value && !open && (
        <div className="mt-1 text-xs text-muted-foreground truncate">
          Sélectionné : {value}
        </div>
      )}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {hasGroups
            ? Object.entries(grouped).map(([group, items]) => (
                <li key={group}>
                  {group && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                      {group}
                    </div>
                  )}
                  {items.map((option) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent',
                          idx === highlightIndex && 'bg-accent',
                          option.value === value && 'font-medium'
                        )}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => handleSelect(option)}
                      >
                        {option.value === value && <Check className="w-3.5 h-3.5 text-primary" />}
                        <span className={option.value === value ? '' : 'ml-5.5'}>{option.label}</span>
                      </button>
                    );
                  })}
                </li>
              ))
            : filtered.map((option, idx) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent',
                      idx === highlightIndex && 'bg-accent',
                      option.value === value && 'font-medium'
                    )}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => handleSelect(option)}
                  >
                    {option.value === value && <Check className="w-3.5 h-3.5 text-primary" />}
                    <span className={option.value === value ? '' : 'ml-5.5'}>{option.label}</span>
                  </button>
                </li>
              ))}
        </ul>
      )}
      {open && filtered.length === 0 && query.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          Aucun critère trouvé
        </div>
      )}
    </div>
  );
};
