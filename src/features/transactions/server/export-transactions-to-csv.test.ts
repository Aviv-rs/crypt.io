import { test, expect } from "bun:test";
import {
  buildCsvHeader,
  buildCsvRow,
  escapeCsvCell,
} from "./export-transactions-to-csv";

test("escapeCsvCell renders bare strings without quoting", () => {
  expect(escapeCsvCell("ethereum")).toBe("ethereum");
  expect(escapeCsvCell(0.1)).toBe("0.1");
});

test("escapeCsvCell renders null and undefined as empty cells", () => {
  expect(escapeCsvCell(null)).toBe("");
  expect(escapeCsvCell(undefined)).toBe("");
});

test("escapeCsvCell quotes commas, quotes, CRs, and LFs", () => {
  expect(escapeCsvCell("a,b")).toBe(`"a,b"`);
  expect(escapeCsvCell('say "hi"')).toBe(`"say ""hi"""`);
  expect(escapeCsvCell("line\nbreak")).toBe(`"line\nbreak"`);
  expect(escapeCsvCell("carriage\rreturn")).toBe(`"carriage\rreturn"`);
});

test("escapeCsvCell serializes Date as ISO string", () => {
  const iso = "2024-01-02T03:04:05.000Z";
  expect(escapeCsvCell(new Date(iso))).toBe(iso);
});

test("buildCsvRow joins cells with commas and ends with CRLF", () => {
  expect(buildCsvRow(["id", "method", null, "ETH"])).toBe("id,method,,ETH\r\n");
});

test("buildCsvHeader prepends UTF-8 BOM and CRLF", () => {
  const header = buildCsvHeader(["id", "method"]);
  expect(header.charCodeAt(0)).toBe(0xfeff);
  expect(header.slice(1)).toBe("id,method\r\n");
});
