import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "../types/transactions.types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatNetwork,
} from "../utils/format";
import { AssetCell } from "./AssetCell";
import { MethodBadge } from "./MethodBadge";

const COLUMN_LABELS = [
  "Type",
  "Asset",
  "Counterparty",
  "Network",
  "Fee",
  "Date",
] as const;

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

export function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Table className="border-separate border-spacing-y-1.5">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-0 [&>th]:border-0">
          {COLUMN_LABELS.map((label) => (
            <TableHead key={label} className={headerCellClass}>
              {label}
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
