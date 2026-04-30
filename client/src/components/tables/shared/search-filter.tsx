import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

export interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = "Filter...",
  className,
}: SearchFilterProps) {
  return (
    <div className={className ?? "relative max-w-xs flex-1"}>
      <IconSearch className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="pl-8"
      />
    </div>
  );
}
