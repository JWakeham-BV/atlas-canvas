import { Search, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
}

export interface SearchBarHandle {
  focus: () => void;
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(
  function SearchBar(
    {
      value,
      onChange,
      placeholder = "Search operations...",
      resultsCount,
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        inputRef.current?.select();
      },
    }));

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 z-10 text-white/90 pointer-events-none"
          strokeWidth={2.5}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-11 ${value ? "pr-8" : "pr-20"} py-2.5
            bg-[#141e2d]/90 border border-primary/30
            rounded-xl text-sm text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
            transition-all duration-200
            backdrop-blur-sm
          `}
          aria-label="Search operations"
        />
        {value ? (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : !isFocused ? (
          <div className="absolute right-3 items-center gap-1 pointer-events-none hidden sm:flex">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/50 bg-white/5 border border-white/10 rounded">
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/50 bg-white/5 border border-white/10 rounded">
              K
            </kbd>
          </div>
        ) : null}
      </div>
      {value && resultsCount !== undefined && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-1.5 text-xs text-white/60 bg-[#141e2d]/95 border border-primary/20 rounded-lg backdrop-blur-sm">
          {resultsCount} {resultsCount === 1 ? "result" : "results"}
        </div>
      )}
    </div>
  );
});
