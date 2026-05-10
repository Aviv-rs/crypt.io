import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_LABELS = [
  "Method",
  "Asset",
  "Counterparty",
  "Network",
  "Fee",
  "Date",
] as const;

const headerCellClass =
  "text-[10px] uppercase tracking-wider text-muted-foreground font-medium";

const pillRowClass =
  "bg-card/60 [&>td]:border-y [&>td]:border-border " +
  "[&>td:first-child]:border-l [&>td:first-child]:rounded-l-lg " +
  "[&>td:last-child]:border-r [&>td:last-child]:rounded-r-lg";

const SKELETON_WIDTHS = [
  "w-20", // Method badge
  "w-40", // Asset amount
  "w-28", // Counterparty
  "w-24", // Network
  "w-16", // Fee
  "w-32", // Date
] as const;

export function TransactionsTableSkeleton({
  rowCount = 10,
}: {
  rowCount?: number;
}) {
  return (
    <Table className="border-separate border-spacing-y-2.5">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-0 [&>th]:border-0">
          {COLUMN_LABELS.map((label, columnIndex) => (
            <TableHead
              key={label}
              className={`${headerCellClass} ${columnIndex === 0 ? "pl-4" : ""}`}
            >
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className={pillRowClass}>
            {SKELETON_WIDTHS.map((width, columnIndex) => (
              <TableCell
                key={columnIndex}
                className={`py-3 ${columnIndex === 0 ? "pl-4" : ""} ${
                  columnIndex === SKELETON_WIDTHS.length - 1 ? "pr-4" : ""
                }`}
              >
                <Skeleton className={`h-4 ${width}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
