// Pure net-worth forecasting + account-history shaping.
// No React, no localStorage — see the suite-level "domain functions are pure" rule.

export type ForecastPoint = {
  label: string;
  monthKey: string;
  netWorth: number;
  goal: number;
};

export type AccountHistoryRow = {
  month: string;
  label: string;
  [key: string]: string | number;
};

/** Current month as a `YYYY-MM` value. */
export function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Shift a `YYYY-MM` value by `delta` months (negative shifts backwards). */
export function addMonths(month: string, delta: number): string {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return currentMonthValue();
  }
  const nextDate = new Date(year, monthIndex + delta, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
}

/** Lexicographic comparison works for zero-padded `YYYY-MM` values. */
export function compareMonths(left: string, right: string): number {
  return left.localeCompare(right);
}

/** Whole months between two `YYYY-MM` values (end − start). */
export function diffMonths(startMonth: string, endMonth: string): number {
  const [startYearRaw, startMonthRaw] = startMonth.split("-");
  const [endYearRaw, endMonthRaw] = endMonth.split("-");
  const startYear = Number(startYearRaw);
  const startMonthNumber = Number(startMonthRaw);
  const endYear = Number(endYearRaw);
  const endMonthNumber = Number(endMonthRaw);
  if (
    !Number.isFinite(startYear) ||
    !Number.isFinite(startMonthNumber) ||
    !Number.isFinite(endYear) ||
    !Number.isFinite(endMonthNumber)
  ) {
    return 0;
  }
  return (endYear - startYear) * 12 + (endMonthNumber - startMonthNumber);
}

/** Clamp a `YYYY-MM` value into the inclusive `[min, max]` range. */
export function clampMonth(value: string, min: string, max: string): string {
  if (!value) return min;
  if (compareMonths(value, min) < 0) return min;
  if (compareMonths(value, max) > 0) return max;
  return value;
}

/** Human label for a `YYYY-MM` value, e.g. "Mar 25". */
export function formatMonthLabel(month: string): string {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const date = new Date(year, monthIndex, 1);
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleString("en-AU", { month: "short", year: "2-digit" });
}

/**
 * Project net worth forward month-by-month from `baseMonth`, applying the
 * monthly savings delta and optional compounding growth, returning only the
 * points that fall inside `[rangeStart, rangeEnd]`.
 */
export function projectNetWorth(params: {
  baseMonth: string;
  startNetWorth: number;
  monthlyDelta: number;
  monthlyGrowthRate: number;
  rangeStart: string;
  rangeEnd: string;
  goalTarget: number;
}): ForecastPoint[] {
  const { baseMonth, startNetWorth, monthlyDelta, monthlyGrowthRate, rangeStart, rangeEnd, goalTarget } = params;
  const finalOffset = Math.max(0, diffMonths(baseMonth, rangeEnd));
  const points: ForecastPoint[] = [];
  let running = startNetWorth;

  for (let offset = 0; offset <= finalOffset; offset += 1) {
    const month = addMonths(baseMonth, offset);
    if (offset > 0) {
      running = running * (1 + monthlyGrowthRate) + monthlyDelta;
    }
    if (compareMonths(month, rangeStart) >= 0 && compareMonths(month, rangeEnd) <= 0) {
      points.push({
        label: formatMonthLabel(month),
        monthKey: month,
        netWorth: Number(running.toFixed(2)),
        goal: goalTarget
      });
    }
  }

  return points;
}

/**
 * Convert an annual growth rate (percent) into the equivalent monthly rate,
 * or 0 when compounding is disabled.
 */
export function monthlyGrowthRate(annualGrowthPercent: number, enabled: boolean): number {
  if (!enabled) return 0;
  return Math.pow(1 + Math.max(0, annualGrowthPercent) / 100, 1 / 12) - 1;
}

/**
 * Drop locked accounts from each history row, keeping only the `acct_<id>`
 * columns for `liquidAccountIds` and recomputing `totalNetWorth` from them.
 */
export function stripLockedAccountHistory(
  rows: AccountHistoryRow[],
  liquidAccountIds: string[]
): AccountHistoryRow[] {
  return rows.map((row) => {
    const next: AccountHistoryRow = { month: row.month, label: row.label, totalNetWorth: 0 };
    let liquidTotal = 0;
    for (const id of liquidAccountIds) {
      const value = row[`acct_${id}`];
      if (typeof value === "number") {
        next[`acct_${id}`] = value;
        liquidTotal += value;
      }
    }
    next.totalNetWorth = Number(liquidTotal.toFixed(2));
    return next;
  });
}
