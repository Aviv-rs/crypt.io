import { useState } from "react";
import { Download, Eye, Layers } from "lucide-react";
import { toast } from "sonner";
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
import type {
  FilterEntry,
  SortDirection,
  SortableColumn,
} from "../transactions.types";

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

function parseFilenameFromContentDisposition(
  contentDisposition: string | null,
): string | undefined {
  if (!contentDisposition) return undefined;
  const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i.exec(
    contentDisposition,
  );
  const raw = match?.[1];
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function readExportErrorDetail(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  if (body && typeof body.error === "string" && body.error.length > 0) {
    return body.error;
  }
  return `HTTP ${response.status}`;
}

export function ExportMenu({ sort, dir, filters }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadExport = async (scope: "view" | "all") => {
    const url = buildExportUrl(scope, { sort, dir, filters });
    setIsExporting(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const detail = await readExportErrorDetail(response);
        console.error("[GET /api/transactions/export]", {
          scope,
          url,
          status: response.status,
          detail,
        });
        toast.error("Export failed unexpectedly, please try again later.");
        return;
      }

      const blob = await response.blob();
      const filename =
        parseFilenameFromContentDisposition(
          response.headers.get("content-disposition"),
        ) ?? "transactions.csv";

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.rel = "noopener";
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Export failed unexpectedly";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" loading={isExporting} loadingText="Exporting…">
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
        <DropdownMenuItem onClick={() => void downloadExport("view")}>
          <Eye data-icon="inline-start" />
          Current view
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void downloadExport("all")}>
          <Layers data-icon="inline-start" />
          Full dataset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
