import { useEffect, useMemo, useState } from "react";
import './DashboardTab.css';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  addMonths,
  clampMonth,
  compareMonths,
  currentMonthValue,
  formatCurrency,
  formatTimelineLabel,
  monthlyGrowthRate,
  projectNetWorth,
  stripLockedAccountHistory,
} from "../../domain";
import type { ForecastPoint, MonthlyExpenseData } from "../../domain";
import { ChartTooltip } from "../../components/dashboard/ChartTooltip";

function GoalCrossoverBadge({ viewBox, label }: { viewBox?: { x: number; y: number; height: number }; label: string }) {
  if (!viewBox) return null;
  const { x } = viewBox;
  const text = label;
  const badgeW = text.length * 7 + 12;
  const badgeH = 22;
  const badgeX = x - badgeW / 2;
  const badgeY = 10;
  return (
    <g>
      <rect x={badgeX} y={badgeY} width={badgeW} height={badgeH} rx={5} fill="var(--accent-warm)" opacity={0.95} />
      <text x={x} y={badgeY + 14.5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="600" fontFamily="inherit">
        {text}
      </text>
    </g>
  );
}

function SavingsRateCard({
  savingsRate,
  monthlySavings,
  currency,
}: {
  savingsRate: number | null;
  monthlySavings: number;
  currency: string;
}) {
  const r = 50, cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const rate = savingsRate ?? 0;
  const progressLength = arcLength * Math.min(1, Math.max(0, rate / 100));

  const statusLabel =
    savingsRate === null ? null
    : savingsRate >= 20 ? "OPTIMAL"
    : savingsRate >= 10 ? "GOOD"
    : "LOW";

  return (
    <div className="fire-insight-card">
      <div className="fire-insight-card-icon fire-insight-card-icon--savings" style={{ color: "var(--accent-leaf)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="2" y="11" width="18" height="9" rx="3" fill="currentColor" opacity="0.85"/>
          <path d="M9.5 9V3.5M9.5 3.5L7 6M9.5 3.5L12 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.5 11h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>
      <h3 className="fire-insight-card-title">Savings Rate</h3>
      <p className="fire-insight-card-subtitle">Percentage of income retained</p>
      <div className="fire-savings-gauge-wrap">
        <svg viewBox="0 0 120 120" className="fire-savings-gauge">
          <circle
            r={r} cx={cx} cy={cy}
            fill="none"
            stroke="var(--line)"
            strokeWidth={8}
            strokeDasharray={`${arcLength.toFixed(1)} ${(circumference - arcLength).toFixed(1)}`}
            strokeLinecap="round"
            transform={`rotate(135, ${cx}, ${cy})`}
          />
          {savingsRate !== null && (
            <circle
              r={r} cx={cx} cy={cy}
              fill="none"
              stroke="var(--accent-leaf)"
              strokeWidth={8}
              strokeDasharray={`${progressLength.toFixed(1)} ${(circumference - progressLength).toFixed(1)}`}
              strokeLinecap="round"
              transform={`rotate(135, ${cx}, ${cy})`}
            />
          )}
        </svg>
        <div className="fire-savings-gauge-center">
          <span className="fire-savings-gauge-pct">
            {savingsRate !== null ? `${Math.round(rate)}%` : "—"}
          </span>
          {statusLabel && (
            <span className="fire-savings-gauge-status">{statusLabel}</span>
          )}
        </div>
      </div>
      <p className="fire-insight-card-note">
        {savingsRate !== null
          ? `${formatCurrency(Math.round(Math.abs(monthlySavings)), currency)}/month in savings`
          : "Configure Income tab to calculate"}
      </p>
    </div>
  );
}

function FireTimelineCard({
  currentAge,
  projectedFireAge,
  onAdjustClick,
}: {
  currentAge: number;
  projectedFireAge: number | null;
  onAdjustClick: () => void;
}) {
  const targetAge = projectedFireAge !== null ? Math.ceil(projectedFireAge) : null;
  const progress = targetAge !== null ? Math.min(1, currentAge / targetAge) : 0;

  return (
    <div className="fire-insight-card">
      <div className="fire-insight-card-icon fire-insight-card-icon--fire" style={{ color: "var(--accent-warm)" }}>
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 14c3.314 0 6-2.462 6-5.5 0-1.8-.9-3.2-2-4.1-.2 1.3-.8 2.1-1.5 2.4C10.2 5 9.5 2.5 7.5 1c0 2-1 3.2-2 4-.5.4-1 1.2-1 2.5 0 .7.2 1.3.5 1.8C4.4 9 4 8.2 4 7.4c-.6.8-1 1.9-1 3.1C3 13.5 5.2 14 8 14Z" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
      <h3 className="fire-insight-card-title">FIRE Timeline</h3>
      <p className="fire-insight-card-subtitle">Estimated retirement age</p>
      {targetAge !== null ? (
        <>
          <div className="fire-timeline-age">
            <span className="fire-timeline-age-num">{targetAge}</span>
            <span className="fire-timeline-age-unit"> Years Old</span>
          </div>
          <div className="fire-timeline-track">
            <div
              className="fire-timeline-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="fire-timeline-labels">
            <span>Current: {currentAge}</span>
            <span>Target: {targetAge}</span>
          </div>
        </>
      ) : (
        <p className="fire-insight-card-note">
          Add transaction data to see your timeline
        </p>
      )}
      <button
        type="button"
        className="fire-timeline-adjust-btn"
        onClick={onAdjustClick}
      >
        Adjust Simulations
      </button>
    </div>
  );
}

function FireInsightBanner({
  projectedFireAge,
  yearsToFire,
}: {
  projectedFireAge: number | null;
  yearsToFire: number | null;
}) {
  if (projectedFireAge === null || yearsToFire === null || yearsToFire <= 0) {
    return null;
  }
  const yrs = Math.ceil(yearsToFire);
  return (
    <div className="border border-line rounded-md p-4 bg-surface shadow-soft flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent-warm)]/12 flex items-center justify-center" style={{ color: "var(--accent-warm)" }}>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 14c3.314 0 6-2.462 6-5.5 0-1.8-.9-3.2-2-4.1-.2 1.3-.8 2.1-1.5 2.4C10.2 5 9.5 2.5 7.5 1c0 2-1 3.2-2 4-.5.4-1 1.2-1 2.5 0 .7.2 1.3.5 1.8C4.4 9 4 8.2 4 7.4c-.6.8-1 1.9-1 3.1C3 13.5 5.2 14 8 14Z" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-display text-[0.98rem] text-ink m-0 mb-[0.35rem]">
          At this rate, you could retire at {Math.ceil(projectedFireAge)}.
        </h3>
        <p className="m-0 text-[0.78rem] text-muted">
          That's {yrs} {yrs === 1 ? "year" : "years"} from now, based on your current saving patterns.
        </p>
      </div>
    </div>
  );
}

const ALLOCATION_COLORS = [
  "#C4856A", "#7BA3A8", "#8B7BAD", "#A8B87B", "#AD7B8B",
  "#7BA88B", "#B8A87B", "#7B8BAD", "#A87B7B", "#7BADB8",
];
const PIE_SLICE_STROKE = "var(--bg-surface)";
const EXPENSE_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const EXPENSE_OVERFLOW_OPACITY = 0.72;

type ExpensePieDatum = {
  name: string;
  value: number;
  color: string;
};

type AccountEntry = {
  id: string;
  name: string;
  value: number;
  kind: "asset" | "liability";
  lockedUntilAge?: number;
};

type AccountSummary = {
  assets: number;
  liabilities: number;
  netWorth: number;
  liquidNetWorth: number;
  lockedAssets: number;
};

type AccountHistorySeries = {
  accountId: string;
  dataKey: string;
  label: string;
  color: string;
};

type AccountHistoryChartRow = {
  month: string;
  label: string;
  [key: string]: string | number;
};

export function DashboardTab({
  currency,
  accountSummary,
  hideLockedInTrend,
  onHideLockedInTrendChange,
  startNetWorth,
  monthlyForecastDelta,
  forecastPoints,
  maxGoalTarget,
  accountHistorySeries,
  accountHistoryChartData,
  expensePieData,
  monthlyExpenseData,
  accountEntries,
  timelinePeriod,
  savingsRate,
  monthlySavings,
  projectedFireAge,
  yearsToFire,
  currentAge,
  onGoToFire,
  onTransactionDrilldown,
}: {
  currency: string;
  accountSummary: AccountSummary;
  hideLockedInTrend: boolean;
  onHideLockedInTrendChange: (hidden: boolean) => void;
  startNetWorth: number;
  monthlyForecastDelta: number;
  forecastPoints: ForecastPoint[];
  maxGoalTarget: number;
  accountHistorySeries: AccountHistorySeries[];
  accountHistoryChartData: AccountHistoryChartRow[];
  expensePieData: ExpensePieDatum[];
  monthlyExpenseData: MonthlyExpenseData;
  accountEntries: AccountEntry[];
  timelinePeriod: "all" | `${number}-${number}`;
  savingsRate: number | null;
  monthlySavings: number;
  projectedFireAge: number | null;
  yearsToFire: number | null;
  currentAge: number;
  onGoToFire: () => void;
  onTransactionDrilldown: (preset: { startMonth?: string; endMonth?: string; categoryGroup?: string }) => void;
}) {
  const accountHistoryBounds = useMemo(() => {
    const months = accountHistoryChartData.map((row) => row.month).filter(Boolean).sort(compareMonths);
    return {
      min: months[0] ?? "",
      max: months[months.length - 1] ?? ""
    };
  }, [accountHistoryChartData]);

  const forecastDefaults = useMemo(() => {
    const baseMonth = forecastPoints[0]?.monthKey ?? currentMonthValue();
    const defaultEndMonth = forecastPoints[forecastPoints.length - 1]?.monthKey ?? addMonths(baseMonth, 17);
    return { baseMonth, defaultEndMonth };
  }, [forecastPoints]);

  const [accountStartMonth, setAccountStartMonth] = useState(accountHistoryBounds.min);
  const [accountEndMonth, setAccountEndMonth] = useState(accountHistoryBounds.max);
  const [forecastStartMonth, setForecastStartMonth] = useState(forecastDefaults.baseMonth);
  const [forecastEndMonth, setForecastEndMonth] = useState(forecastDefaults.defaultEndMonth);
  const [forecastCompoundingEnabled, setForecastCompoundingEnabled] = useState(false);
  const [forecastAnnualGrowthRate, setForecastAnnualGrowthRate] = useState(5);

  useEffect(() => {
    if (!accountHistoryBounds.min || !accountHistoryBounds.max) {
      setAccountStartMonth("");
      setAccountEndMonth("");
      return;
    }
    setAccountStartMonth((previous) => (
      previous ? clampMonth(previous, accountHistoryBounds.min, accountHistoryBounds.max) : accountHistoryBounds.min
    ));
    setAccountEndMonth((previous) => (
      previous ? clampMonth(previous, accountHistoryBounds.min, accountHistoryBounds.max) : accountHistoryBounds.max
    ));
  }, [accountHistoryBounds.max, accountHistoryBounds.min]);

  useEffect(() => {
    setForecastStartMonth((previous) => (
      previous && compareMonths(previous, forecastDefaults.baseMonth) >= 0
        ? previous
        : forecastDefaults.baseMonth
    ));
    setForecastEndMonth((previous) => (
      previous && compareMonths(previous, forecastDefaults.baseMonth) >= 0
        ? previous
        : forecastDefaults.defaultEndMonth
    ));
  }, [forecastDefaults.baseMonth, forecastDefaults.defaultEndMonth]);

  const accountRange = useMemo(() => {
    if (!accountHistoryBounds.min || !accountHistoryBounds.max) {
      return null;
    }
    const clampedStart = clampMonth(accountStartMonth || accountHistoryBounds.min, accountHistoryBounds.min, accountHistoryBounds.max);
    const clampedEnd = clampMonth(accountEndMonth || accountHistoryBounds.max, accountHistoryBounds.min, accountHistoryBounds.max);
    return compareMonths(clampedStart, clampedEnd) <= 0
      ? { start: clampedStart, end: clampedEnd }
      : { start: clampedEnd, end: clampedStart };
  }, [accountEndMonth, accountHistoryBounds.max, accountHistoryBounds.min, accountStartMonth]);

  const lockedAccountIds = useMemo(
    () => new Set(accountEntries.filter((a) => a.lockedUntilAge !== undefined).map((a) => a.id)),
    [accountEntries]
  );
  const hasLockedAccounts = lockedAccountIds.size > 0;

  const visibleAccountHistorySeries = useMemo(() => {
    if (!hideLockedInTrend || !hasLockedAccounts) return accountHistorySeries;
    return accountHistorySeries.filter((s) => !lockedAccountIds.has(s.accountId));
  }, [accountHistorySeries, hideLockedInTrend, hasLockedAccounts, lockedAccountIds]);

  const visibleAccountHistoryChartData = useMemo(() => {
    const rangeFiltered = !accountRange
      ? accountHistoryChartData
      : accountHistoryChartData.filter((row) => (
          compareMonths(row.month, accountRange.start) >= 0 &&
          compareMonths(row.month, accountRange.end) <= 0
        ));
    if (!hideLockedInTrend || !hasLockedAccounts) return rangeFiltered;
    const liquidAccountIds = accountEntries
      .filter((account) => !lockedAccountIds.has(account.id))
      .map((account) => account.id);
    return stripLockedAccountHistory(rangeFiltered, liquidAccountIds);
  }, [accountHistoryChartData, accountRange, hideLockedInTrend, hasLockedAccounts, lockedAccountIds, accountEntries]);

  const forecastRange = useMemo(() => {
    const start = compareMonths(forecastStartMonth || forecastDefaults.baseMonth, forecastDefaults.baseMonth) < 0
      ? forecastDefaults.baseMonth
      : (forecastStartMonth || forecastDefaults.baseMonth);
    const endCandidate = compareMonths(forecastEndMonth || forecastDefaults.defaultEndMonth, forecastDefaults.baseMonth) < 0
      ? forecastDefaults.baseMonth
      : (forecastEndMonth || forecastDefaults.defaultEndMonth);
    return compareMonths(start, endCandidate) <= 0
      ? { start, end: endCandidate }
      : { start: endCandidate, end: start };
  }, [
    forecastDefaults.baseMonth,
    forecastDefaults.defaultEndMonth,
    forecastEndMonth,
    forecastStartMonth
  ]);

  const forecastMonthlyGrowthRate = monthlyGrowthRate(forecastAnnualGrowthRate, forecastCompoundingEnabled);

  const visibleForecastPoints = useMemo(
    () =>
      projectNetWorth({
        baseMonth: forecastDefaults.baseMonth,
        startNetWorth,
        monthlyDelta: monthlyForecastDelta,
        monthlyGrowthRate: forecastMonthlyGrowthRate,
        rangeStart: forecastRange.start,
        rangeEnd: forecastRange.end,
        goalTarget: maxGoalTarget
      }),
    [
      forecastDefaults.baseMonth,
      forecastMonthlyGrowthRate,
      forecastRange.end,
      forecastRange.start,
      maxGoalTarget,
      monthlyForecastDelta,
      startNetWorth
    ]
  );

  const expensePeriodLabel = formatTimelineLabel(timelinePeriod);
  const expenseChartTitle = timelinePeriod === "all"
    ? "Where Your Spending Goes"
    : `Where Your Spending Went · ${expensePeriodLabel}`;

  const handleCategoryPieClick = (categoryName: string) => {
    if (!categoryName || categoryName === "Other") {
      return;
    }
    onTransactionDrilldown({
      categoryGroup: categoryName,
      startMonth: timelinePeriod === "all" ? "" : timelinePeriod,
      endMonth: timelinePeriod === "all" ? "" : timelinePeriod
    });
  };

  const handleMonthlyCategoryClick = (month: string, categoryGroup: string) => {
    if (!month || !categoryGroup) {
      return;
    }
    onTransactionDrilldown({
      categoryGroup,
      startMonth: month,
      endMonth: month
    });
  };

  return (
    <>
      <div className="fire-insight-cards">
        <SavingsRateCard
          savingsRate={savingsRate}
          monthlySavings={monthlySavings}
          currency={currency}
        />
        <FireTimelineCard
          currentAge={currentAge}
          projectedFireAge={projectedFireAge}
          onAdjustClick={onGoToFire}
        />
      </div>
      <FireInsightBanner
        projectedFireAge={projectedFireAge}
        yearsToFire={yearsToFire}
      />

      <section className="grid grid-cols-4 gap-[0.65rem]">
        <article className="border border-line rounded-md px-4 py-[0.9rem] bg-surface shadow-soft hover:border-line-strong transition-colors">
          <h2 className="text-[0.72rem] uppercase tracking-[0.12em] text-muted font-bold">Current Net Worth</h2>
          <p className="font-mono text-ink font-semibold tracking-[-0.03em] mt-[0.38rem] text-[clamp(1.2rem,1.8vw,1.55rem)]">{formatCurrency(startNetWorth, currency)}</p>
          {accountSummary.lockedAssets > 0 ? (
            <span className="text-[0.68rem] text-muted font-normal mt-[0.2rem] inline-block">
              + {formatCurrency(accountSummary.lockedAssets, currency)} locked
            </span>
          ) : null}
        </article>
        <article className="border border-line rounded-md px-4 py-[0.9rem] bg-surface shadow-soft hover:border-line-strong transition-colors">
          <h2 className="text-[0.72rem] uppercase tracking-[0.12em] text-muted font-bold">Monthly Delta</h2>
          <p className="font-mono text-ink font-semibold tracking-[-0.03em] mt-[0.38rem] text-[clamp(1.2rem,1.8vw,1.55rem)]">{formatCurrency(monthlyForecastDelta, currency)}</p>
        </article>
        <article className="border border-line rounded-md px-4 py-[0.9rem] bg-surface shadow-soft hover:border-line-strong transition-colors">
          <h2 className="text-[0.72rem] uppercase tracking-[0.12em] text-muted font-bold">Assets</h2>
          <p className="font-mono text-ink font-semibold tracking-[-0.03em] mt-[0.38rem] text-[clamp(1.2rem,1.8vw,1.55rem)]">{formatCurrency(accountSummary.assets, currency)}</p>
        </article>
        <article className="border border-line rounded-md px-4 py-[0.9rem] bg-surface shadow-soft hover:border-line-strong transition-colors">
          <h2 className="text-[0.72rem] uppercase tracking-[0.12em] text-muted font-bold">Liabilities</h2>
          <p className="font-mono text-ink font-semibold tracking-[-0.03em] mt-[0.38rem] text-[clamp(1.2rem,1.8vw,1.55rem)]">{formatCurrency(accountSummary.liabilities, currency)}</p>
        </article>
      </section>

      <section className="border border-line rounded-md p-4 bg-surface shadow-soft min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-base tracking-[-0.02em] text-ink">Account Trend</h3>
            <p className="text-muted text-[0.82rem] mt-[0.42rem]">
              Stacked area view by account over time.
              {hasLockedAccounts && hideLockedInTrend ? " Locked accounts hidden." : null}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {hasLockedAccounts ? (
              <label className="flex items-center gap-[0.45rem] text-[0.78rem] text-ink-soft cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideLockedInTrend}
                  onChange={(event) => onHideLockedInTrendChange(event.target.checked)}
                />
                <span>Hide locked accounts</span>
              </label>
            ) : null}
            <label className="grid gap-1 text-[0.72rem] uppercase tracking-[0.1em] text-muted font-bold">
              Start
              <input
                type="month"
                value={accountStartMonth}
                min={accountHistoryBounds.min || undefined}
                max={accountRange?.end || accountHistoryBounds.max || undefined}
                disabled={!accountHistoryBounds.min}
                className="border border-line-strong bg-surface text-ink rounded-sm px-[0.6rem] py-[0.45rem] text-[0.83rem] focus:outline-none focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                onChange={(event) => setAccountStartMonth(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-[0.72rem] uppercase tracking-[0.1em] text-muted font-bold">
              End
              <input
                type="month"
                value={accountEndMonth}
                min={accountRange?.start || accountHistoryBounds.min || undefined}
                max={accountHistoryBounds.max || undefined}
                disabled={!accountHistoryBounds.max}
                className="border border-line-strong bg-surface text-ink rounded-sm px-[0.6rem] py-[0.45rem] text-[0.83rem] focus:outline-none focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                onChange={(event) => setAccountEndMonth(event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="mt-[0.68rem] h-[360px]">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart
              data={visibleAccountHistoryChartData}
              margin={{ top: 12, right: 24, bottom: 8, left: 4 }}
            >
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--muted)" }}
              />
              <YAxis
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--muted)" }}
                width={96}
                tickFormatter={(value) =>
                  formatCurrency(Number(value), currency)
                }
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(value) => formatCurrency(value, currency)}
                    showTotal
                  />
                }
              />
              <Legend />
              <ReferenceLine
                y={0}
                stroke="var(--chart-ref)"
                strokeDasharray="4 4"
              />
              {visibleAccountHistorySeries.map((series) => (
                <Area
                  key={series.accountId}
                  type="monotone"
                  dataKey={series.dataKey}
                  name={series.label}
                  stackId="balances"
                  stroke={series.color}
                  fill={series.color}
                  fillOpacity={0.18}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border border-line rounded-md p-4 bg-surface shadow-soft min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base tracking-[-0.02em] text-ink">Forecast</h3>
            <p className="text-muted text-[0.82rem] mt-[0.42rem]">
              {forecastCompoundingEnabled
                ? `Includes ${forecastAnnualGrowthRate}% annual growth, compounded monthly, plus your current monthly savings rate.`
                : "Projects net worth from your current monthly savings rate."}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-[0.72rem] uppercase tracking-[0.1em] text-muted font-bold">
              Start
              <input
                type="month"
                value={forecastStartMonth}
                min={forecastDefaults.baseMonth}
                max={forecastRange.end}
                className="border border-line-strong bg-surface text-ink rounded-sm px-[0.6rem] py-[0.45rem] text-[0.83rem] focus:outline-none focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                onChange={(event) => setForecastStartMonth(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-[0.72rem] uppercase tracking-[0.1em] text-muted font-bold">
              End
              <input
                type="month"
                value={forecastEndMonth}
                min={forecastRange.start}
                className="border border-line-strong bg-surface text-ink rounded-sm px-[0.6rem] py-[0.45rem] text-[0.83rem] focus:outline-none focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                onChange={(event) => setForecastEndMonth(event.target.value)}
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-sm border border-line bg-[var(--bg)] px-3 py-[0.55rem] text-[0.78rem] text-ink">
              <input
                type="checkbox"
                checked={forecastCompoundingEnabled}
                onChange={(event) => setForecastCompoundingEnabled(event.target.checked)}
              />
              Compound growth
            </label>
            <label className="grid gap-1 text-[0.72rem] uppercase tracking-[0.1em] text-muted font-bold">
              Annual Growth
              <input
                type="number"
                min="0"
                step="0.1"
                value={forecastAnnualGrowthRate}
                disabled={!forecastCompoundingEnabled}
                className="border border-line-strong bg-surface text-ink rounded-sm px-[0.6rem] py-[0.45rem] text-[0.83rem] focus:outline-none focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-ring)] disabled:opacity-50"
                onChange={(event) => setForecastAnnualGrowthRate(Number(event.target.value) || 0)}
              />
            </label>
          </div>
        </div>
        <div className="mt-[0.8rem] h-[360px]">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={visibleForecastPoints}
              margin={{ top: 44, right: 24, bottom: 8, left: 4 }}
            >
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--muted)" }}
              />
              <YAxis
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--muted)" }}
                width={96}
                tickFormatter={(value) =>
                  formatCurrency(Number(value), currency)
                }
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(value) => formatCurrency(value, currency)}
                  />
                }
              />
              {maxGoalTarget > 0 ? (
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="var(--accent-warm)"
                  strokeDasharray="6 5"
                  dot={false}
                  name="Goal"
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--accent)" }}
                name="Net Worth"
              />
              {(() => {
                if (maxGoalTarget <= 0) return null;
                const crossover = visibleForecastPoints.find((p, i) =>
                  p.goal > 0 &&
                  p.netWorth >= p.goal &&
                  (i === 0 || visibleForecastPoints[i - 1].netWorth < visibleForecastPoints[i - 1].goal)
                );
                if (!crossover) return null;
                return (
                  <ReferenceLine
                    x={crossover.label}
                    stroke="var(--accent-warm)"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={(props) => <GoalCrossoverBadge {...props} label={crossover.label} />}
                  />
                );
              })()}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {(expensePieData.length > 0 || accountEntries.length > 0) ? (
        <section className="border border-line rounded-md p-4 bg-surface shadow-soft min-w-0 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {accountEntries.length > 0 ? (
            <div>
              <h3 className="font-display text-base tracking-[-0.02em] text-ink mb-2">Asset Allocation</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={accountEntries.map((a) => ({ name: a.name || "Untitled", value: Math.abs(a.value), kind: a.kind }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={114}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      stroke={PIE_SLICE_STROKE}
                      strokeWidth={2}
                    >
                      {accountEntries.map((account, index) => (
                        <Cell
                          key={account.id}
                          fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                          opacity={account.kind === "liability" ? 0.5 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          formatter={(value) => formatCurrency(value, currency)}
                        />
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          {expensePieData.length > 0 ? (
            <div>
              <h3 className="font-display text-base tracking-[-0.02em] text-ink mb-2">{expenseChartTitle}</h3>
              <p className="text-muted text-[0.78rem] mt-0 mb-3">
                {timelinePeriod === "all" ? "Share of spend across all imported data." : `Share of spend for ${expensePeriodLabel}.`}
              </p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={114}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      stroke={PIE_SLICE_STROKE}
                      strokeWidth={2}
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={EXPENSE_CHART_COLORS[index % EXPENSE_CHART_COLORS.length]}
                          fillOpacity={index < EXPENSE_CHART_COLORS.length ? 1 : EXPENSE_OVERFLOW_OPACITY}
                          style={{ cursor: entry.name === "Other" ? "default" : "pointer" }}
                          onClick={() => handleCategoryPieClick(entry.name)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          formatter={(value) => formatCurrency(value, currency)}
                        />
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {monthlyExpenseData.rows.length > 0 ? (
        <section className="border border-line rounded-md p-4 bg-surface shadow-soft min-w-0">
          <h3 className="font-display text-base tracking-[-0.02em] text-ink">Monthly Spending by Category</h3>
          <p className="text-muted text-[0.82rem] mt-[0.42rem]">Month-by-month expense breakdown across your imported history. Click a segment to inspect matching transactions.</p>
          <div className="mt-[0.68rem] h-[360px]">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={monthlyExpenseData.rows} margin={{ top: 12, right: 24, bottom: 8, left: 4 }} barCategoryGap="28%">
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--chart-axis)" tick={{ fill: "var(--muted)" }} />
                <YAxis
                  stroke="var(--chart-axis)"
                  tick={{ fill: "var(--muted)" }}
                  width={96}
                  tickFormatter={(value) => formatCurrency(Number(value), currency)}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value) => formatCurrency(value, currency)}
                    />
                  }
                />
                <Legend />
                {monthlyExpenseData.categories.map((categoryConfig, index) => (
                  <Bar
                    key={categoryConfig.category}
                    dataKey={categoryConfig.category}
                    stackId="expenses"
                    fill={categoryConfig.color}
                    radius={index === monthlyExpenseData.categories.length - 1 ? [4, 4, 0, 0] : undefined}
                    style={{ cursor: "pointer" }}
                    onClick={(data) => handleMonthlyCategoryClick(data?.payload?.month ?? "", categoryConfig.category)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}
    </>
  );
}
