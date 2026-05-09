import { useState } from "react";
import { ListFilter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterEntrySchema,
  type FilterableColumn,
  type FilterEntry,
} from "../transactions.types";

type FilterKeyMeta = {
  key: FilterableColumn;
  label: string;
  inputType: "text" | "date";
};

const FILTER_KEYS: FilterKeyMeta[] = [
  { key: "method", label: "Method", inputType: "text" },
  { key: "network", label: "Network", inputType: "text" },
  { key: "buyCurrency", label: "Buy currency", inputType: "text" },
  { key: "sellCurrency", label: "Sell currency", inputType: "text" },
  { key: "dateFrom", label: "Date from", inputType: "date" },
  { key: "dateTo", label: "Date to", inputType: "date" },
];

const FILTER_LABELS = Object.fromEntries(
  FILTER_KEYS.map((meta) => [meta.key, meta.label]),
) as Record<FilterableColumn, string>;

function formatFilterValue(entry: FilterEntry): string {
  if (entry.value instanceof Date) {
    return entry.value.toISOString().slice(0, 10);
  }
  return entry.value;
}

type Props = {
  filters: FilterEntry[];
  onChange: (filters: FilterEntry[]) => void;
};

export function FilterBar({ filters, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [draftKey, setDraftKey] = useState<FilterableColumn>("method");
  const [draftValue, setDraftValue] = useState("");

  const draftMeta = FILTER_KEYS.find((meta) => meta.key === draftKey)!;

  const submitDraft = () => {
    const trimmed = draftValue.trim();
    if (!trimmed) return;
    const candidate = { key: draftKey, value: trimmed };
    const parsed = filterEntrySchema.safeParse(candidate);
    if (!parsed.success) return;
    const withoutSameKey = filters.filter((entry) => entry.key !== draftKey);
    onChange([...withoutSameKey, parsed.data]);
    setDraftValue("");
    setPickerOpen(false);
  };

  const removeFilter = (key: FilterableColumn) => {
    onChange(filters.filter((entry) => entry.key !== key));
  };

  const filterCount = filters.length;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
      <Button
        variant="outline"
        size="sm"
        className="md:hidden self-start"
        onClick={() => setMobileExpanded((open) => !open)}
        aria-expanded={mobileExpanded}
      >
        <ListFilter data-icon="inline-start" />
        Filters{filterCount > 0 ? ` (${filterCount})` : ""}
      </Button>

      <div
        className={`flex flex-wrap items-center gap-2 ${mobileExpanded ? "flex" : "hidden"} md:flex`}
      >
        {filters.map((entry) => (
          <span
            key={entry.key}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
          >
            <span className="text-muted-foreground">
              {FILTER_LABELS[entry.key]}:
            </span>
            <span className="font-medium">{formatFilterValue(entry)}</span>
            <button
              type="button"
              aria-label={`Remove ${FILTER_LABELS[entry.key]} filter`}
              onClick={() => removeFilter(entry.key)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm">
                <Plus data-icon="inline-start" />
                Add filter
              </Button>
            }
          />
          <PopoverContent align="start" className="w-72 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Filter by</span>
              <Select
                value={draftKey}
                onValueChange={(value) => {
                  setDraftKey(value as FilterableColumn);
                  setDraftValue("");
                }}
              >
                <SelectTrigger size="sm">
                  <SelectValue>
                    {(selectedKey: FilterableColumn) =>
                      selectedKey != null ? FILTER_LABELS[selectedKey] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FILTER_KEYS.map((meta) => (
                    <SelectItem key={meta.key} value={meta.key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Value</span>
              <Input
                type={draftMeta.inputType}
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitDraft();
                }}
              />
            </div>
            <Button
              size="sm"
              onClick={submitDraft}
              disabled={!draftValue.trim()}
            >
              Apply filter
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
