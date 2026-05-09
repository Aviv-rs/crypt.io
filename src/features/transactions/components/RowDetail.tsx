import type { Transaction } from "../transactions.types";
import { formatAmount } from "../utils/format";

const DASH = "—";

type DetailField = {
  label: string;
  value: string | null;
  mono?: boolean;
};

function buildFields(transaction: Transaction): DetailField[] {
  const tokenSummary = [
    transaction.buyToken && `buy ${transaction.buyToken}`,
    transaction.sellToken && `sell ${transaction.sellToken}`,
    transaction.feeToken && `fee ${transaction.feeToken}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return [
    { label: "Tx hash", value: transaction.txHash, mono: true },
    { label: "Block height", value: transaction.blockHeight, mono: true },
    { label: "Smart contract", value: transaction.smartContract, mono: true },
    { label: "Tokens", value: tokenSummary || null, mono: true },
    {
      label: "Buy",
      value: formatAmount(transaction.buyAmount, transaction.buyCurrency),
    },
    {
      label: "Sell",
      value: formatAmount(transaction.sellAmount, transaction.sellCurrency),
    },
    {
      label: "Fee",
      value: formatAmount(transaction.feeAmount, transaction.feeCurrency),
    },
    {
      label: "Sender",
      value: transaction.senderAddress,
      mono: true,
    },
    {
      label: "Receiver",
      value: transaction.receiverAddress,
      mono: true,
    },
    { label: "Comments", value: transaction.comments },
  ];
}

export function RowDetail({ transaction }: { transaction: Transaction }) {
  const fields = buildFields(transaction);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-4 py-3">
      {fields.map((field) => (
        <div
          key={field.label}
          className="flex flex-col text-xs gap-0.5 min-w-0"
        >
          <span className="uppercase tracking-wider text-muted-foreground/80">
            {field.label}
          </span>
          <span
            className={`break-all ${field.mono ? "font-mono" : ""} ${
              field.value ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {field.value && field.value.length > 0 ? field.value : DASH}
          </span>
        </div>
      ))}
    </div>
  );
}
