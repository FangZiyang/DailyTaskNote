import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface QuickAddProps {
  onAdd: (title: string) => void;
}

export interface QuickAddHandle {
  focus: () => void;
}

export const QuickAdd = forwardRef<QuickAddHandle, QuickAddProps>(({ onAdd }, ref) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    document.addEventListener("focus-add-input", handler);
    return () => document.removeEventListener("focus-add-input", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-2 py-2 border-t border-gray-200/30 dark:border-gray-700/30">
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="flex-shrink-0 opacity-40"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a task... (Enter)"
          className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-40"
        />
      </div>
    </form>
  );
});

QuickAdd.displayName = "QuickAdd";
