import "./ChartTooltip.css";

type Payload = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

type Props = {
  active?: boolean;
  payload?: Payload[];
  label?: string | number;
  formatter?: (value: number, name?: string) => string;
  labelFormatter?: (label: string | number) => string;
  showTotal?: boolean;
  totalLabel?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  showTotal,
  totalLabel = "Total",
}: Props) {
  if (!active || !payload?.length) return null;

  const formatValue = (v: number | string | undefined, name?: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return String(v ?? "");
    return formatter ? formatter(n, name) : String(n);
  };

  const displayLabel =
    label !== undefined && label !== ""
      ? labelFormatter
        ? labelFormatter(label)
        : label
      : null;

  const total = showTotal
    ? payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0)
    : null;

  return (
    <div className="chart-tooltip">
      {displayLabel !== null ? (
        <div className="chart-tooltip-label">{displayLabel}</div>
      ) : null}
      <ul className="chart-tooltip-items">
        {payload.map((entry, index) => (
          <li
            key={`${entry.dataKey ?? entry.name ?? index}`}
            className="chart-tooltip-row"
          >
            <span
              className="chart-tooltip-swatch"
              style={{ background: entry.color }}
            />
            <span className="chart-tooltip-name">{entry.name}</span>
            <span className="chart-tooltip-value">
              {formatValue(entry.value, String(entry.name ?? ""))}
            </span>
          </li>
        ))}
      </ul>
      {showTotal && total !== null ? (
        <div className="chart-tooltip-total">
          <span>{totalLabel}</span>
          <span className="chart-tooltip-value">{formatValue(total)}</span>
        </div>
      ) : null}
    </div>
  );
}
