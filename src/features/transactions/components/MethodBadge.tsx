import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Coins,
  Gift,
  HandCoins,
  Heart,
  Layers,
  PiggyBank,
  Receipt,
  Repeat,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MethodTone = "success" | "error" | "info" | "neutral";

type MethodMeta = {
  label: string;
  tone: MethodTone;
  Icon: typeof ArrowDownLeft;
};

const METHOD_META: Record<string, MethodMeta> = {
  deposit: { label: "Deposit", tone: "success", Icon: ArrowDownLeft },
  withdrawal: { label: "Withdraw", tone: "error", Icon: ArrowUpRight },
  trade: { label: "Trade", tone: "info", Icon: ArrowLeftRight },
  transfer: { label: "Transfer", tone: "info", Icon: Repeat },
  bridge: { label: "Bridge", tone: "info", Icon: Layers },
  fee: { label: "Fee", tone: "error", Icon: Receipt },
  gift: { label: "Gift", tone: "success", Icon: Gift },
  donate: { label: "Donate", tone: "error", Icon: Heart },
  income: { label: "Income", tone: "success", Icon: Coins },
  income_future: {
    label: "Income (future)",
    tone: "success",
    Icon: TrendingUp,
  },
  income_lending: {
    label: "Income (lending)",
    tone: "success",
    Icon: HandCoins,
  },
  lost_future: { label: "Loss (future)", tone: "error", Icon: TrendingDown },
  poolin: { label: "Pool in", tone: "success", Icon: PiggyBank },
  poolout: { label: "Pool out", tone: "error", Icon: PiggyBank },
  staking: { label: "Staking", tone: "success", Icon: Coins },
};

const TONE_CLASSES: Record<MethodTone, string> = {
  success: "text-success border-success bg-success/15",
  error: "text-destructive border-destructive bg-destructive/15",
  info: "text-info border-info bg-info/15",
  neutral: "text-muted-foreground border-muted-foreground/40 bg-muted/40",
};

export function MethodBadge({ method }: { method: string }) {
  const meta = METHOD_META[method.toLowerCase()] ?? {
    label: method.charAt(0).toUpperCase() + method.slice(1),
    tone: "neutral" as const,
    Icon: ArrowLeftRight,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        TONE_CLASSES[meta.tone],
      )}
    >
      <meta.Icon className="size-2.5" strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}

export function getMethodTone(method: string): MethodTone {
  return METHOD_META[method.toLowerCase()]?.tone ?? "neutral";
}
