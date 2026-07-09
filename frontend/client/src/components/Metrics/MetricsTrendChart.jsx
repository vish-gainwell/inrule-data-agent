import { formatInteger } from './metricsUtils';

const chartWidth = 420;
const chartHeight = 150;
const plotPadding = {
  top: 12,
  right: 14,
  bottom: 14,
  left: 14,
};
const plotLeft = plotPadding.left;
const plotRight = chartWidth - plotPadding.right;
const plotTop = plotPadding.top;
const plotBottom = chartHeight - plotPadding.bottom;
const plotWidth = plotRight - plotLeft;
const plotHeight = plotBottom - plotTop;

const formatTrendDate = (value) => {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MetricsTrendChart = ({ title, data, valueKey, color, fillColor, yAxisMax }) => {
  const values = data.map((item) => Number(item[valueKey]) || 0);
  const max = Math.max(...values, 0);
  const sharedMax = Number(yAxisMax);
  const scaleMax = Number.isFinite(sharedMax) && sharedMax > 0 ? sharedMax : max > 0 ? max : 1;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const value = Number(item[valueKey]) || 0;
    const x = data.length > 1 ? plotLeft + index * step : chartWidth / 2;
    const y = plotBottom - (value / scaleMax) * plotHeight;
    return { x, y, value, label: formatTrendDate(item.date) };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints =
    points.length > 0
      ? `${linePoints} ${points[points.length - 1].x},${plotBottom} ${points[0].x},${plotBottom}`
      : '';
  const yTicks = [scaleMax, scaleMax * 0.75, scaleMax * 0.5, scaleMax * 0.25, 0];
  const gridLines = [0, 0.25, 0.5, 0.75].map((ratio) => plotTop + ratio * plotHeight);
  const labelStep =
    points.length <= 31 ? 1 : points.length <= 62 ? 2 : points.length <= 124 ? 4 : Math.ceil(points.length / 24);
  const shouldShowLabel = (index) =>
    index === 0 || index === points.length - 1 || index % labelStep === 0;

  return (
    <div className="metrics-kpi-card">
      <h4>{title}</h4>
      {data.length === 0 ? (
        <div className="metrics-empty-mini">No trend data</div>
      ) : (
        <div className="metrics-chart">
          <div className="metrics-chart-y-axis">
            {yTicks.map((tick, index) => (
              <span key={index}>{formatInteger(Math.round(tick))}</span>
            ))}
          </div>
          <div className="metrics-chart-plot">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              {gridLines.map((y) => (
                <line
                  key={y}
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#eee"
                  strokeWidth="0.5"
                />
              ))}
              <line
                x1={plotLeft}
                y1={plotBottom}
                x2={plotRight}
                y2={plotBottom}
                stroke="#ddd"
                strokeWidth="1"
              />
              {points.length > 1 && <polygon points={areaPoints} fill={fillColor} stroke="none" />}
              <polyline
                points={linePoints}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {points.map((point, index) => (
                <circle
                  key={`${point.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="#fff"
                  stroke={color}
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="metrics-chart-x-axis">
              {points.map((point, index) => (
                <span
                  key={`${point.label}-${index}`}
                  className={[
                    shouldShowLabel(index) ? '' : 'metrics-chart-label-hidden',
                    index === 0
                      ? 'metrics-chart-label-start'
                      : index === points.length - 1
                        ? 'metrics-chart-label-end'
                        : 'metrics-chart-label-middle',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ left: `${(point.x / chartWidth) * 100}%` }}
                >
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsTrendChart;
