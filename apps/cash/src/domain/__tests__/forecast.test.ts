import { describe, expect, it } from "vitest";
import {
  addMonths,
  clampMonth,
  compareMonths,
  diffMonths,
  formatMonthLabel,
  monthlyGrowthRate,
  projectNetWorth,
  stripLockedAccountHistory,
  type AccountHistoryRow
} from "../forecast";

describe("month helpers", () => {
  it("adds and subtracts months across year boundaries", () => {
    expect(addMonths("2025-01", 1)).toBe("2025-02");
    expect(addMonths("2025-12", 1)).toBe("2026-01");
    expect(addMonths("2025-01", -1)).toBe("2024-12");
    expect(addMonths("2025-06", 12)).toBe("2026-06");
  });

  it("compares zero-padded month values chronologically", () => {
    expect(compareMonths("2025-01", "2025-02")).toBeLessThan(0);
    expect(compareMonths("2026-01", "2025-12")).toBeGreaterThan(0);
    expect(compareMonths("2025-03", "2025-03")).toBe(0);
  });

  it("counts whole months between values", () => {
    expect(diffMonths("2025-01", "2025-01")).toBe(0);
    expect(diffMonths("2025-01", "2025-12")).toBe(11);
    expect(diffMonths("2025-01", "2026-01")).toBe(12);
    expect(diffMonths("2025-06", "2025-01")).toBe(-5);
  });

  it("clamps into an inclusive range", () => {
    expect(clampMonth("2024-01", "2025-01", "2025-12")).toBe("2025-01");
    expect(clampMonth("2026-01", "2025-01", "2025-12")).toBe("2025-12");
    expect(clampMonth("2025-06", "2025-01", "2025-12")).toBe("2025-06");
    expect(clampMonth("", "2025-01", "2025-12")).toBe("2025-01");
  });

  it("formats a month label and falls back on garbage input", () => {
    expect(formatMonthLabel("2025-03")).toBe("Mar 25");
    expect(formatMonthLabel("not-a-month")).toBe("not-a-month");
  });
});

describe("monthlyGrowthRate", () => {
  it("is zero when compounding is disabled", () => {
    expect(monthlyGrowthRate(7, false)).toBe(0);
  });

  it("converts an annual rate to its compounded monthly equivalent", () => {
    const monthly = monthlyGrowthRate(12, true);
    expect(Math.pow(1 + monthly, 12) - 1).toBeCloseTo(0.12, 10);
  });

  it("floors negative annual rates at zero", () => {
    expect(monthlyGrowthRate(-5, true)).toBe(0);
  });
});

describe("projectNetWorth", () => {
  it("adds the monthly delta each step with no growth", () => {
    const points = projectNetWorth({
      baseMonth: "2025-01",
      startNetWorth: 1000,
      monthlyDelta: 100,
      monthlyGrowthRate: 0,
      rangeStart: "2025-01",
      rangeEnd: "2025-03",
      goalTarget: 5000
    });
    expect(points.map((p) => p.netWorth)).toEqual([1000, 1100, 1200]);
    expect(points.map((p) => p.monthKey)).toEqual(["2025-01", "2025-02", "2025-03"]);
    expect(points.every((p) => p.goal === 5000)).toBe(true);
  });

  it("only returns points inside the requested window but compounds from baseMonth", () => {
    const points = projectNetWorth({
      baseMonth: "2025-01",
      startNetWorth: 1000,
      monthlyDelta: 100,
      monthlyGrowthRate: 0,
      rangeStart: "2025-03",
      rangeEnd: "2025-04",
      goalTarget: 0
    });
    // Window starts at month 3, but running total reflects months 1-3 of growth.
    expect(points.map((p) => p.monthKey)).toEqual(["2025-03", "2025-04"]);
    expect(points.map((p) => p.netWorth)).toEqual([1200, 1300]);
  });

  it("applies compounding growth on top of contributions", () => {
    const points = projectNetWorth({
      baseMonth: "2025-01",
      startNetWorth: 1000,
      monthlyDelta: 0,
      monthlyGrowthRate: 0.01,
      rangeStart: "2025-01",
      rangeEnd: "2025-02",
      goalTarget: 0
    });
    expect(points[1].netWorth).toBeCloseTo(1010, 2);
  });
});

describe("stripLockedAccountHistory", () => {
  const rows: AccountHistoryRow[] = [
    { month: "2025-01", label: "Jan 25", acct_a: 100, acct_b: 50, totalNetWorth: 150 },
    { month: "2025-02", label: "Feb 25", acct_a: 120, acct_b: 60, totalNetWorth: 180 }
  ];

  it("keeps only liquid account columns and recomputes the total", () => {
    const result = stripLockedAccountHistory(rows, ["a"]);
    expect(result[0]).toEqual({ month: "2025-01", label: "Jan 25", acct_a: 100, totalNetWorth: 100 });
    expect(result[1]).toEqual({ month: "2025-02", label: "Feb 25", acct_a: 120, totalNetWorth: 120 });
    expect(result[0]).not.toHaveProperty("acct_b");
  });

  it("zeroes the total when no accounts remain liquid", () => {
    const result = stripLockedAccountHistory(rows, []);
    expect(result[0].totalNetWorth).toBe(0);
  });
});
