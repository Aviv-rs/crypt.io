import { Download, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FilterEntry, SortDirection, SortableColumn } from "../transactions.types";

type Props = {
  sort: SortableColumn;
  dir: SortDirection;
  filters: FilterEntry[];
};

function buildExportUrl(
  scope: "view" | "all",
  { sort, dir, filters }: Props,
): string {
  const params = new URLSearchParams();
  params.set("scope", scope);
  if (scope === "view") {
    params.set("sort", sort);
    params.set("dir", dir);
    if (filters.length > 0) {
      params.set("filters", JSON.stringify(filters));
    }
  }
  return `/api/transactions/export?${params.toString()}`;
}

export function ExportMenu({ sort, dir, filters }: Props) {
  const triggerDownload = (scope: "view" | "all") => {
    window.location.href = buildExportUrl(scope, { sort, dir, filters });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Download data-icon="inline-start" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Download as CSV</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => triggerDownload("view")}>
          <Eye data-icon="inline-start" />
          Current view
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => triggerDownload("all")}>
          <Layers data-icon="inline-start" />
          Full dataset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
