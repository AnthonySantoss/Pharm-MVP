"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Drug } from "@/types";

interface DrugAutocompleteProps {
  drugs: Drug[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  exclude?: string | string[];
}

export function DrugAutocomplete({
  drugs,
  value,
  onChange,
  placeholder = "Buscar medicamento...",
  disabled,
  exclude,
}: DrugAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredDrugs = useMemo(() => {
    const excludeList = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    if (!search) return drugs.filter(d => !excludeList.includes(d.inn));
    const searchLower = search.toLowerCase();
    return drugs
      .filter(
        (drug) =>
          (drug.inn?.toLowerCase().includes(searchLower) ||
            drug.dcb?.toLowerCase().includes(searchLower)) &&
          !excludeList.includes(drug.inn)
      );
  }, [drugs, search, exclude]);

  const selectedDrug = useMemo(() => {
    return drugs.find((d) => d.inn === value);
  }, [drugs, value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (drug: Drug) => {
    onChange(drug.inn);
    setIsOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDrugs.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDrugs.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredDrugs[highlightedIndex]) {
          handleSelect(filteredDrugs[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : selectedDrug ? selectedDrug.dcb || selectedDrug.inn : ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectedDrug && "text-foreground font-medium"
          )}
        />
        {selectedDrug ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        )}
      </div>

      {isOpen && filteredDrugs.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-2 py-2 bg-popover rounded-lg border border-border shadow-lg animate-scale-in overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto">
            {filteredDrugs.map((drug, index) => (
              <button
                key={drug.inn}
                type="button"
                onClick={() => handleSelect(drug)}
                className={cn(
                  "w-full px-4 py-3 text-left flex items-center justify-between transition-colors",
                  index === highlightedIndex
                    ? "bg-primary/10"
                    : "hover:bg-muted",
                  drug.inn === value && "bg-primary/5"
                )}
              >
                <div>
                  <p className="font-medium text-foreground">
                    {drug.dcb || drug.inn}
                  </p>
                  {drug.dcb && (
                    <p className="text-xs text-muted-foreground">{drug.inn}</p>
                  )}
                </div>
                {drug.inn === value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && search && filteredDrugs.length === 0 && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-popover rounded-lg border border-border shadow-lg animate-scale-in">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum medicamento encontrado
          </p>
        </div>
      )}
    </div>
  );
}