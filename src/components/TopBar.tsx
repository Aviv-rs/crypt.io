import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="h-16 border-b border-border bg-background/60 backdrop-blur-sm">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="ml-auto">{children}</div>
      </div>
    </header>
  );
}
