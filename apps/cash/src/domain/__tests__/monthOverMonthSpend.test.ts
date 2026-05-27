import { describe, expect, it } from "vitest";
import { monthOverMonthSpendChange, type MonthlyExpenseData } from "../visualization";

const categories = [
  { category: "Food", color: "var(--chart-1)" },
  { category: "Transport", color: "var(--chart-2)" }
];

function data(rows: MonthlyExpenseData["rows"]): MonthlyExpenseData {
  return { rows, categories };
}

describe("monthOverMonthSpendChange", () => {
  it("returns null with fewer than two months", () => {
    expect(monthOverMonthSpendChange(data([]))).toBeNull();
    expect(monthOverMonthSpendChange(data([{ month: "2025-01", label: "Jan", Food: 100, Transport: 0 }]))).toBeNull();
  });

  it("reports an increase as up", () => {
    const result = monthOverMonthSpendChange(
      data([
        { month: "2025-01", label: "Jan", Food: 100, Transport: 0 },
        { month: "2025-02", label: "Feb", Food: 110, Transport: 10 }
      ])
    );
    expect(result).toEqual({ pct: 20, up: true });
  });

  it("reports a decrease as down with absolute percentage", () => {
    const result = monthOverMonthSpendChange(
      data([
        { month: "2025-01", label: "Jan", Food: 200, Transport: 0 },
        { month: "2025-02", label: "Feb", Food: 150, Transport: 0 }
      ])
    );
    expect(result).toEqual({ pct: 25, up: false });
  });

  it("returns null when the prior month had no spend", () => {
    const result = monthOverMonthSpendChange(
      data([
        { month: "2025-01", label: "Jan", Food: 0, Transport: 0 },
        { month: "2025-02", label: "Feb", Food: 100, Transport: 0 }
      ])
    );
    expect(result).toBeNull();
  });
});
