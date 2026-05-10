import logoUrl from "@/assets/images/logo.svg";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img src={logoUrl} alt="" aria-hidden className={cn("size-7", className)} />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-base font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      crypt<span className="text-primary">.io</span>
    </span>
  );
}
