import { SearchIcon } from "@sanity/icons";
import { TextInput } from "@sanity/ui";
import { useEffect, useRef } from "react";

/** Debounced search input - uncontrolled to prevent parent re-renders on typing */
export function DebouncedSearchInput({
  onSearch,
  delay = 300,
}: {
  onSearch: (value: string) => void;
  delay?: number;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <TextInput
      icon={SearchIcon}
      placeholder="Search..."
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onSearch(value), delay);
      }}
      fontSize={1}
      padding={3}
    />
  );
}
