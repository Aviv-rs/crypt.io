import { Skeleton } from "@/components/ui/skeleton";

export function TransactionsCardListSkeleton({
  rowCount = 6,
}: {
  rowCount?: number;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: rowCount }).map((_, index) => (
        <li
          key={index}
          className="rounded-xl border border-foreground/10 bg-card p-3 flex flex-col gap-2 shadow-md"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-44" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}
