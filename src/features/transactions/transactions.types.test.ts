import { test, expect } from "bun:test";
import {
  parseGetTransactionsParams,
  parseSearchParamsWithFallback,
  transactionsSearchSchema,
} from "./transactions.types";

function parse(query: string) {
  return parseGetTransactionsParams(new URLSearchParams(query));
}

test("server parser fills defaults when no params are present", () => {
  const params = parse("");
  expect(params.page).toBe(1);
  expect(params.pageSize).toBe(50);
  expect(params.sort).toBe("date");
  expect(params.dir).toBe("desc");
  expect(params.filters).toEqual([]);
});

test("server parser coerces page and pageSize from strings", () => {
  const params = parse("page=3&pageSize=25");
  expect(params.page).toBe(3);
  expect(params.pageSize).toBe(25);
});

test("server parser caps pageSize at 200", () => {
  expect(() => parse("pageSize=500")).toThrow();
});

test("server parser rejects unknown sort columns", () => {
  expect(() => parse("sort=password")).toThrow();
});

test("server parser parses filters JSON and validates entries", () => {
  const params = parse(
    `filters=${encodeURIComponent('[{"key":"method","value":"trade"}]')}`,
  );
  expect(params.filters).toEqual([{ key: "method", value: "trade" }]);
});

test("server parser coerces dateFrom values to Date", () => {
  const params = parse(
    `filters=${encodeURIComponent('[{"key":"dateFrom","value":"2024-01-01"}]')}`,
  );
  expect(params.filters).toHaveLength(1);
  const entry = params.filters[0]!;
  expect(entry.key).toBe("dateFrom");
  expect(entry.value).toBeInstanceOf(Date);
});

test("server parser rejects non-JSON filters payload", () => {
  expect(() => parse("filters=[broken")).toThrow(/filters must be valid JSON/);
});

test("server parser rejects unknown filter keys", () => {
  expect(() =>
    parse(`filters=${encodeURIComponent('[{"key":"password","value":"x"}]')}`),
  ).toThrow();
});

test("client search schema accepts an already-parsed object with defaults", () => {
  const result = transactionsSearchSchema.parse({});
  expect(result.page).toBe(1);
  expect(result.filters).toEqual([]);
});

test("client search schema validates filters as a typed array", () => {
  const result = transactionsSearchSchema.parse({
    filters: [{ key: "network", value: "ethereum" }],
  });
  expect(result.filters[0]).toEqual({ key: "network", value: "ethereum" });
});

test("parseSearchParamsWithFallback falls back per-field on bad input", () => {
  const result = parseSearchParamsWithFallback({
    page: -5,
    pageSize: 9999,
    sort: "password",
    dir: "sideways",
    filters: [
      { key: "method", value: "trade" },
      { key: "unknown", value: "x" },
    ],
  });
  expect(result.page).toBe(1);
  expect(result.pageSize).toBe(50);
  expect(result.sort).toBe("date");
  expect(result.dir).toBe("desc");
  expect(result.filters).toEqual([{ key: "method", value: "trade" }]);
});

test("parseSearchParamsWithFallback keeps valid values", () => {
  const result = parseSearchParamsWithFallback({
    page: 3,
    pageSize: 100,
    sort: "feeAmount",
    dir: "asc",
    filters: [],
  });
  expect(result).toEqual({
    page: 3,
    pageSize: 100,
    sort: "feeAmount",
    dir: "asc",
    filters: [],
  });
});
