import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Transaction } from "../transactions.types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatNetwork,
} from "../utils/format";
import { AssetCell } from "./AssetCell";
import { MethodBadge } from "./MethodBadge";
import { RowDetail } from "./RowDetail";

const DASH = "—";

function getCounterpartyAddress(transaction: Transaction): string | null {
  return transaction.senderAddress ?? transaction.receiverAddress;
}

export function TransactionsCardList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ul className="flex flex-col gap-4">
      {transactions.map((transaction) => {
        const isExpanded = expandedId === transaction.id;
        return (
          <li
            key={transaction.id}
            className={cn(
              "rounded-xl border bg-card overflow-hidden shadow-md transition-colors",
              isExpanded ? "border-primary/60" : "border-foreground/15",
            )}
          >
            <Button
              variant="ghost"
              aria-expanded={isExpanded}
              onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
              className="w-full h-auto justify-start text-left p-3 flex flex-col items-stretch gap-2 whitespace-normal rounded-none hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-2">
                <MethodBadge method={transaction.method} />
                <time className="text-xs text-foreground tabular-nums whitespace-nowrap">
                  {formatDate(transaction.date)}
                </time>
              </div>

              <div className="text-sm text-foreground">
                <AssetCell transaction={transaction} />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-foreground">
                <span className="font-mono">
                  {formatAddress(getCounterpartyAddress(transaction))}
                </span>
                <span>{formatNetwork(transaction.network)}</span>
              </div>

              {transaction.feeAmount !== null && (
                <div className="text-xs text-foreground tabular-nums">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    Fee
                  </span>{" "}
                  {formatAmount(
                    transaction.feeAmount,
                    transaction.feeCurrency,
                  ) || DASH}
                </div>
              )}

              <div className="mt-1 pt-2 border-t border-border/50 flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{isExpanded ? "Hide details" : "More info"}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </div>
            </Button>

            {isExpanded && (
              <div className="border-t border-border bg-background/30">
                <RowDetail transaction={transaction} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
