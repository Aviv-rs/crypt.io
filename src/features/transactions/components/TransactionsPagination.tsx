import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { indexRoute } from "@/router";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function buildPageList(
  current: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

export function TransactionsPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = buildPageList(safePage, totalPages);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);

  const goToPage =
    (target: number) => (event: React.MouseEvent) => {
      event.preventDefault();
      if (target < 1 || target > totalPages || target === safePage) return;
      onPageChange(target);
    };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="text-xs text-muted-foreground tabular-nums">
        {total === 0
          ? "No results"
          : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()}`}
      </div>

      <Pagination className="md:mx-0 md:w-auto md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={goToPage(safePage - 1)}
              aria-disabled={safePage <= 1}
              className={safePage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationPageLink
                  pageNumber={item}
                  isActive={item === safePage}
                />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={goToPage(safePage + 1)}
              aria-disabled={safePage >= totalPages}
              className={
                safePage >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger size="sm" className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function PaginationPageLink({
  pageNumber,
  isActive,
}: {
  pageNumber: number;
  isActive: boolean;
}) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      className={cn(
        isActive &&
          "border-primary text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary",
      )}
      nativeButton={false}
      render={
        <Link
          to={indexRoute.fullPath}
          search={(prev) => ({ ...prev, page: pageNumber })}
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
        >
          {pageNumber}
        </Link>
      }
    />
  );
}
