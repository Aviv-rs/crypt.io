import { ArrowRight } from "lucide-react";
import type { Transaction } from "../transactions.types";
import { formatAmount } from "../utils/format";
import { getMethodTone } from "./MethodBadge";

const DASH = "—";

const currencyLabelClass =
  "text-muted-foreground text-xs uppercase max-w-[10ch] truncate inline-block align-bottom";

function amountColorForIncoming(method: string): string {
  const tone = getMethodTone(method);
  if (tone === "success") return "text-success";
  if (tone === "error") return "text-destructive";
  return "";
}

function amountColorForOutgoing(method: string): string {
  const tone = getMethodTone(method);
  if (tone === "error") return "text-destructive";
  if (tone === "success") return "text-success";
  return "";
}

function CurrencyLabel({ currency }: { currency: string | null }) {
  if (!currency) return null;
  return (
    <span className={currencyLabelClass} title={currency}>
      {currency}
    </span>
  );
}

export function AssetCell({ transaction }: { transaction: Transaction }) {
  const { method, buyAmount, buyCurrency, sellAmount, sellCurrency } = transaction;
  const hasBuySide = buyAmount !== null;
  const hasSellSide = sellAmount !== null;

  if (hasBuySide && hasSellSide) {
    return (
      <span className="inline-flex items-center gap-2 text-sm tabular-nums max-w-full">
        <span className="inline-flex items-center gap-1 min-w-0">
          <span>{formatAmount(sellAmount, null)}</span>
          <CurrencyLabel currency={sellCurrency} />
        </span>
        <ArrowRight className="size-3 text-info shrink-0" strokeWidth={2.25} />
        <span className="inline-flex items-center gap-1 min-w-0">
          <span>{formatAmount(buyAmount, null)}</span>
          <CurrencyLabel currency={buyCurrency} />
        </span>
      </span>
    );
  }

  if (hasBuySide) {
    return (
      <span className="inline-flex items-center gap-1 text-sm tabular-nums max-w-full">
        <span className={amountColorForIncoming(method)}>
          + {formatAmount(buyAmount, null)}
        </span>
        <CurrencyLabel currency={buyCurrency} />
      </span>
    );
  }

  if (hasSellSide) {
    return (
      <span className="inline-flex items-center gap-1 text-sm tabular-nums max-w-full">
        <span className={amountColorForOutgoing(method)}>
          − {formatAmount(sellAmount, null)}
        </span>
        <CurrencyLabel currency={sellCurrency} />
      </span>
    );
  }

  return <span className="text-muted-foreground">{DASH}</span>;
}
