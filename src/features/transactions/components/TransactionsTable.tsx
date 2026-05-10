import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  SortableColumn,
  SortDirection,
  Transaction,
} from "../transactions.types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatNetwork,
} from "../utils/format";
import { AssetCell } from "./AssetCell";
import { MethodBadge } from "./MethodBadge";
import { RowDetail } from "./RowDetail";

type ColumnDefinition = {
  label: string;
  sortKey?: SortableColumn;
};

const COLUMNS: ColumnDefinition[] = [
  { label: "Method", sortKey: "method" },
  { label: "Asset" },
  { label: "Counterparty" },
  { label: "Network", sortKey: "network" },
  { label: "Fee", sortKey: "feeAmount" },
  { label: "Date", sortKey: "date" },
];

const headerCellClass =
  "text-[10px] uppercase tracking-wider text-muted-foreground font-medium";

const pillRowClass =
  "bg-card transition-colors cursor-pointer " +
  "[&>td]:bg-card hover:[&>td]:bg-muted/60 " +
  "[&>td]:border-y [&>td]:border-border hover:[&>td]:border-primary/40 " +
  "[&>td:first-child]:border-l [&>td:first-child]:rounded-l-lg " +
  "[&>td:last-child]:border-r [&>td:last-child]:rounded-r-lg " +
  "aria-expanded:[&>td]:bg-muted aria-expanded:[&>td]:border-primary/60";

const expandedRowClass =
  "bg-card/40 [&>td]:border-x [&>td]:border-b [&>td]:border-border [&>td]:rounded-b-lg " +
  "[&>td]:-mt-2";

function getCounterpartyAddress(transaction: Transaction): string | null {
  return transaction.senderAddress ?? transaction.receiverAddress;
}

type SortHeaderProps = {
  column: ColumnDefinition;
  activeSort: SortableColumn;
  activeDir: SortDirection;
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
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onSortChange(column.sortKey!)}
      className={cn(
        "-ml-1 h-auto px-1 py-0.5 font-medium text-muted-foreground hover:text-foreground hover:bg-transparent",
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
    </Button>
  );
}

type Props = {
  transactions: Transaction[];
  sort: SortableColumn;
  dir: SortDirection;
  onSortChange: (column: SortableColumn) => void;
};

export function TransactionsTable({
  transactions,
  sort,
  dir,
  onSortChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpanded = (id: number) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <Table className="border-separate border-spacing-y-2.5">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-0 [&>th]:border-0">
          {COLUMNS.map((column, columnIndex) => {
            const isActiveSort = column.sortKey === sort;
            return (
              <TableHead
                key={column.label}
                className={`${headerCellClass} ${columnIndex === 0 ? "pl-4" : ""}`}
                aria-sort={
                  column.sortKey
                    ? isActiveSort
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                <SortHeader
                  column={column}
                  activeSort={sort}
                  activeDir={dir}
                  onSortChange={onSortChange}
                />
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const isExpanded = expandedId === transaction.id;
          return (
            <Fragment key={transaction.id}>
              <TableRow
                className={pillRowClass}
                aria-expanded={isExpanded}
                onClick={() => toggleExpanded(transaction.id)}
              >
                <TableCell className="py-3 pl-4">
                  <MethodBadge method={transaction.method} />
                </TableCell>
                <TableCell className="py-3 max-w-md truncate">
                  <AssetCell transaction={transaction} />
                </TableCell>
                <TableCell className="font-mono text-xs text-foreground py-3">
                  {formatAddress(getCounterpartyAddress(transaction))}
                </TableCell>
                <TableCell className="text-xs text-foreground py-3">
                  {formatNetwork(transaction.network)}
                </TableCell>
                <TableCell className="tabular-nums text-xs text-foreground py-3">
                  {formatAmount(transaction.feeAmount, transaction.feeCurrency)}
                </TableCell>
                <TableCell className="tabular-nums text-xs text-foreground py-3 pr-4 whitespace-nowrap">
                  {formatDate(transaction.date)}
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow className={expandedRowClass}>
                  <TableCell colSpan={COLUMNS.length} className="p-0">
                    <RowDetail transaction={transaction} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
