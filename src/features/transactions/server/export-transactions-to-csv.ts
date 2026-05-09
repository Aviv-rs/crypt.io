const UTF8_BOM = "﻿";
const NEEDS_QUOTING = /[",\r\n]/;

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = value instanceof Date ? value.toISOString() : String(value);
  if (NEEDS_QUOTING.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildCsvRow(values: readonly unknown[]): string {
  return `${values.map(escapeCsvCell).join(",")}\r\n`;
}

export function buildCsvHeader(columns: readonly string[]): string {
  return `${UTF8_BOM}${buildCsvRow(columns)}`;
}
