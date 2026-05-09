import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SortableColumn, Transaction } from "../types/transactions.types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatNetwork,
} from "../utils/format";
import { AssetCell } from "./AssetCell";
import { MethodBadge } from "./MethodBadge";
import { cn } from "@/lib/utils";

type ColumnDefinition = {
  label: string;
  sortKey?: SortableColumn;
};

const COLUMNS: ColumnDefinition[] = [
  { label: "Type", sortKey: "method" },
  { label: "Asset" },
  { label: "Counterparty" },
  { label: "Network", sortKey: "network" },
  { label: "Fee", sortKey: "feeAmount" },
  { label: "Date", sortKey: "date" },
];

const headerCellClass =
  "text-[10px] uppercase tracking-wider text-muted-foreground font-medium";

const pillRowClass =
  "bg-card/60 hover:bg-card transition-colors " +
  "[&>td]:border-y [&>td]:border-border " +
  "[&>td:first-child]:border-l [&>td:first-child]:rounded-l-lg " +
  "[&>td:last-child]:border-r [&>td:last-child]:rounded-r-lg";

function getCounterpartyAddress(transaction: Transaction): string | null {
  return transaction.senderAddress ?? transaction.receiverAddress;
}

type SortHeaderProps = {
  column: ColumnDefinition;
  activeSort: SortableColumn;
  activeDir: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
};

function SortHeader({
  column,
  activeSort,
  activeDir,
  onSortChange,
}: SortHeaderProps) {
  if (!column.sortKey) {
    return <span>{column.label}</span>;
  }
  const isActive = activeSort === column.sortKey;
  const ArrowIcon = !isActive
    ? ChevronsUpDown
    : activeDir === "asc"
      ? ChevronUp
      : ChevronDown;

  return (
    <button
      type="button"
      onClick={() => onSortChange(column.sortKey!)}
      aria-sort={
        isActive ? (activeDir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground transition-colors",
        isActive && "text-foreground",
      )}
    >
      <span>{column.label}</span>
      <ArrowIcon
        className={cn(
          "size-3 shrink-0",
          !isActive && "text-muted-foreground/60",
        )}
        strokeWidth={2.25}
      />
    </button>
  );
}

type Props = {
  transactions: Transaction[];
  sort: SortableColumn;
  dir: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
};

export function TransactionsTable({
  transactions,
  sort,
  dir,
  onSortChange,
}: Props) {
  return (
    <Table className="border-separate border-spacing-y-1.5">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-0 [&>th]:border-0">
          {COLUMNS.map((column) => (
            <TableHead key={column.label} className={headerCellClass}>
              <SortHeader
                column={column}
                activeSort={sort}
                activeDir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id} className={pillRowClass}>
            <TableCell className="py-3 pl-4">
              <MethodBadge method={transaction.method} />
            </TableCell>
            <TableCell className="py-3 max-w-md truncate">
              <AssetCell transaction={transaction} />
            </TableCell>
            <TableCell className="font-mono text-xs py-3">
              {formatAddress(getCounterpartyAddress(transaction))}
            </TableCell>
            <TableCell className="text-xs py-3">
              {formatNetwork(transaction.network)}
            </TableCell>
            <TableCell className="tabular-nums text-xs py-3">
              {formatAmount(transaction.feeAmount, transaction.feeCurrency)}
            </TableCell>
            <TableCell className="tabular-nums text-xs py-3 pr-4 whitespace-nowrap">
              {formatDate(transaction.date)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
