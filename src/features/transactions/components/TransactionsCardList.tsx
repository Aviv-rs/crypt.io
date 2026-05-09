import type { Transaction } from "../transactions.types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatNetwork,
} from "../utils/format";
import { AssetCell } from "./AssetCell";
import { MethodBadge } from "./MethodBadge";

const DASH = "—";

function getCounterpartyAddress(transaction: Transaction): string | null {
  return transaction.senderAddress ?? transaction.receiverAddress;
}

export function TransactionsCardList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <ul className="flex flex-col gap-2 p-2">
      {transactions.map((transaction) => (
        <li
          key={transaction.id}
          className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <MethodBadge method={transaction.method} />
            <time className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
              {formatDate(transaction.date)}
            </time>
          </div>

          <div className="text-sm">
            <AssetCell transaction={transaction} />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono">
              {formatAddress(getCounterpartyAddress(transaction))}
            </span>
            <span>{formatNetwork(transaction.network)}</span>
          </div>

          {transaction.feeAmount !== null && (
            <div className="text-xs text-muted-foreground tabular-nums">
              <span className="uppercase tracking-wider">Fee</span>{" "}
              {formatAmount(transaction.feeAmount, transaction.feeCurrency) ||
                DASH}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
