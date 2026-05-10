import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-sm text-center flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The route you tried to open doesn't exist.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="self-center"
          nativeButton={false}
          render={<Link to="/" />}
        >
          Back to transactions
        </Button>
      </div>
    </main>
  );
}
