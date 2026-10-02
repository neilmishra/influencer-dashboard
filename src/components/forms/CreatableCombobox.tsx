"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ChevronDown, Plus } from "lucide-react";

interface CreatableComboboxProps {
  id: string;
  label: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export function CreatableCombobox({
  id,
  label,
  name,
  value,
  options,
  placeholder = "Search or add a category...",
  onChange,
}: CreatableComboboxProps) {
  const listId = useId();
  const [activeOptions, setActiveOptions] = useState(() =>
    Array.from(new Set(value ? [...options, value] : options)),
  );
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const normalizedQuery = query.trim();
  const matches = activeOptions.filter((option) =>
    option.toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase()),
  );
  const canAdd = normalizedQuery.length > 0 && !activeOptions.some(
    (option) => option.toLocaleLowerCase() === normalizedQuery.toLocaleLowerCase(),
  );
  const optionCount = matches.length + Number(canAdd);

  function selectValue(nextValue: string, isNew: boolean) {
    if (isNew) {
      setActiveOptions((current) =>
        current.some((option) => option.toLocaleLowerCase() === nextValue.toLocaleLowerCase())
          ? current
          : [nextValue, ...current],
      );
    }
    onChange(nextValue);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(current + 1, optionCount - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      if (canAdd && activeIndex === 0) {
        selectValue(normalizedQuery, true);
      } else {
        const optionIndex = activeIndex - Number(canAdd);
        const option = matches[optionIndex];
        if (option) selectValue(option, false);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          value={isOpen ? query : value}
          placeholder={placeholder}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          onClick={() => {
            if (!isOpen) {
              setQuery("");
              setIsOpen(true);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsOpen(false);
            setQuery("");
            setActiveIndex(-1);
          }}
          className="h-11 w-full border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      <input type="hidden" name={name} value={value} />
      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} options`}
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto border border-slate-200 bg-white py-1 shadow-lg"
        >
          {canAdd ? (
            <li
              id={`${listId}-option-0`}
              role="option"
              aria-selected={activeIndex === 0}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(0)}
              onClick={() => selectValue(normalizedQuery, true)}
              className={`flex min-h-10 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-violet-800 ${activeIndex === 0 ? "bg-violet-50" : "hover:bg-violet-50"}`}
            >
              <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="truncate">Add &apos;{normalizedQuery}&apos;</span>
            </li>
          ) : null}
          {matches.map((option, index) => {
            const optionIndex = index + Number(canAdd);
            return (
              <li
                key={option}
                id={`${listId}-option-${optionIndex}`}
                role="option"
                aria-selected={activeIndex === optionIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(optionIndex)}
                onClick={() => selectValue(option, false)}
                className={`flex min-h-10 cursor-pointer items-center px-3 text-sm text-slate-700 ${activeIndex === optionIndex ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                {option}
              </li>
            );
          })}
          {optionCount === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Type a category to add it.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}