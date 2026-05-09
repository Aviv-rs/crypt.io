import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-svh">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
