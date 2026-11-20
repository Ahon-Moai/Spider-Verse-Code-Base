import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  Users,
  Clock,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Award
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  start_date: string;
  end_date: string;
  summary: {
    revenue: { value: number; prev: number; change_pct: number | null };
    orders: { value: number; prev: number; change_pct: number | null };
    units_sold: { value: number; prev: number; change_pct: number | null };
    aov: { value: number; prev: number; change_pct: number | null };
    customers: { value: number; prev: number; change_pct: number | null };
    pending_orders: { value: number };
  };
  revenue_chart: Array<{ date: string; revenue: number; orders: number }>;
  best_sellers: Array<{
    product_id: string;
    product_name: string;
    brand_name: string;
    image: string;
    current_stock: number;
    units_sold: number;
    total_sales: number;
  }>;
  orders_by_status: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  low_stock: Array<{
    id: string;
    name: string;
    brand: string;
    image: string;
    inventory_qty: number;
    low_stock_threshold: number;
  }>;
  category_performance: Array<{
    category_name: string;
    total_units: number;
    total_revenue: number;
  }>;
}

interface AnalyticsDashboardProps {
  csrfToken: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ csrfToken }) => {
  const [period, setPeriod] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; revenue: number; orders: number } | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/analytics.php?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          'X-Admin-Token': localStorage.getItem('adminToken') || '',
          'X-CSRF-Token': csrfToken
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch analytics (${res.status})`);
      }

      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load analytics data');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to analytics endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom' || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [period, startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    })
      .format(amount)
      .replace('BDT', '৳');
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-56" />
            <div className="h-3.5 bg-zinc-200/70 dark:bg-zinc-800/70 rounded w-72" />
          </div>
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-md w-80 hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-4"
            />
          ))}
        </div>
        <div className="h-72 bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-800 dark:text-rose-200 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Analytics Load Error</span>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="h-8 px-3.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Compute SVG chart path
  const chartPoints = data.revenue_chart;
  const maxRevenue = Math.max(...chartPoints.map((p) => p.revenue), 100);
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = 20;

  const getX = (index: number) => {
    if (chartPoints.length <= 1) return padding;
    return padding + (index / (chartPoints.length - 1)) * (svgWidth - padding * 2);
  };

  const getY = (value: number) => {
    return svgHeight - padding - (value / maxRevenue) * (svgHeight - padding * 2);
  };

  const polylinePoints = chartPoints
    .map((p, i) => `${getX(i)},${getY(p.revenue)}`)
    .join(' ');

  const areaPoints =
    chartPoints.length > 0
      ? `${getX(0)},${svgHeight - padding} ${polylinePoints} ${getX(chartPoints.length - 1)},${svgHeight - padding}`
      : '';

  const hoveredIndex = hoveredPoint
    ? chartPoints.findIndex((p) => p.date === hoveredPoint.date)
    : -1;

  const statusList = [
    { key: 'pending', label: 'Pending', count: data.orders_by_status.pending, bar: 'bg-amber-500' },
    { key: 'confirmed', label: 'Confirmed', count: data.orders_by_status.confirmed, bar: 'bg-sky-500' },
    { key: 'processing', label: 'Processing', count: data.orders_by_status.processing, bar: 'bg-indigo-500' },
    { key: 'shipped', label: 'Shipped', count: data.orders_by_status.shipped, bar: 'bg-violet-500' },
    { key: 'delivered', label: 'Delivered', count: data.orders_by_status.delivered, bar: 'bg-emerald-500' },
    { key: 'cancelled', label: 'Cancelled', count: data.orders_by_status.cancelled, bar: 'bg-zinc-400 dark:bg-zinc-600' }
  ];
  const totalStatusCount = Math.max(
    statusList.reduce((sum, s) => sum + (s.count || 0), 0),
    1
  );

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data.summary.revenue.value),
      changePct: data.summary.revenue.change_pct,
      icon: DollarSign
    },
    {
      label: 'Total Orders',
      value: data.summary.orders.value.toLocaleString(),
      changePct: data.summary.orders.change_pct,
      icon: ShoppingBag
    },
    {
      label: 'Units Sold',
      value: data.summary.units_sold.value.toLocaleString(),
      changePct: data.summary.units_sold.change_pct,
      icon: PackageCheck
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(data.summary.aov.value),
      changePct: data.summary.aov.change_pct,
      icon: Award
    },
    {
      label: 'Active Customers',
      value: data.summary.customers.value.toLocaleString(),
      changePct: data.summary.customers.change_pct,
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Date Range Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Analytics &amp; Business Insights
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time performance tracking based on verified store transactions
          </p>
        </div>

        {/* Date Filter Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  period === p.id
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="h-8 w-8 inline-flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Selector Input Group */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg">
          <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 px-2.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 font-mono text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 px-2.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 font-mono text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
          </div>
        </div>
      )}

      {/* KPI Cards Grid (6 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-[#111113] p-4 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">{card.label}</span>
                <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight font-mono tabular-nums">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                {card.changePct !== null ? (
                  <>
                    {card.changePct >= 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5 tabular-nums">
                        <TrendingUp className="w-3 h-3" />+{card.changePct}%
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-0.5 tabular-nums">
                        <TrendingDown className="w-3 h-3" />
                        {card.changePct}%
                      </span>
                    )}
                    <span className="text-zinc-400 dark:text-zinc-500">vs prev.</span>
                  </>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500">No prev. baseline</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Pending Orders */}
        <div className="bg-white dark:bg-[#111113] p-4 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Pending Orders</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight font-mono tabular-nums">
            {data.summary.pending_orders.value}
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Requires fulfillment
          </div>
        </div>
      </div>

      {/* Interactive Revenue Chart */}
      <div className="bg-white dark:bg-[#111113] p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Revenue Trend
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Daily revenue trajectory over selected timeframe
            </p>
          </div>
          {hoveredPoint ? (
            <div className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-3 self-start sm:self-auto font-mono tabular-nums">
              <span className="text-zinc-300 dark:text-zinc-600">{hoveredPoint.date}</span>
              <span className="font-semibold">{formatCurrency(hoveredPoint.revenue)}</span>
              <span className="text-zinc-400 dark:text-zinc-500">
                {hoveredPoint.orders} orders
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              Hover nodes for daily breakdown
            </div>
          )}
        </div>

        <div className="relative w-full overflow-hidden pt-2 text-zinc-950 dark:text-zinc-100">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
          >
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line
              x1={padding}
              y1={padding}
              x2={svgWidth - padding}
              y2={padding}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeDasharray="3 3"
            />
            <line
              x1={padding}
              y1={svgHeight / 2}
              x2={svgWidth - padding}
              y2={svgHeight / 2}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeDasharray="3 3"
            />
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              className="stroke-zinc-200 dark:stroke-zinc-800"
            />

            {/* Vertical Hover Crosshair */}
            {hoveredIndex >= 0 && (
              <line
                x1={getX(hoveredIndex)}
                y1={padding}
                x2={getX(hoveredIndex)}
                y2={svgHeight - padding}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeDasharray="2 2"
              />
            )}

            {/* Area Fill */}
            {areaPoints && <polygon points={areaPoints} fill="url(#revenueAreaGradient)" />}

            {/* Trend Polyline */}
            {polylinePoints && (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            {/* Interactive Data Nodes */}
            {chartPoints.map((point, i) => {
              const cx = getX(i);
              const cy = getY(point.revenue);
              const isHovered = hoveredIndex === i;
              return (
                <g key={i} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 3.5}
                    className="fill-white dark:fill-zinc-950 stroke-zinc-950 dark:stroke-zinc-100 transition-all"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 px-2 font-mono tabular-nums">
            <span>{chartPoints[0]?.date}</span>
            <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.date}</span>
            <span>{chartPoints[chartPoints.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Analytics Main Dashboard Grid: Best Sellers & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Best-Selling Products (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                Best-Selling Products
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Top products ranked by actual completed sales volume
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
              {data.best_sellers.length} items
            </span>
          </div>

          {data.best_sellers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No sales data recorded in this date range.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {data.best_sellers.map((item, idx) => (
                <div
                  key={item.product_id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 font-mono text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0 text-center tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="w-9 h-9 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PackageCheck className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {item.brand_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-right tabular-nums">
                    <div>
                      <span className="block font-mono font-medium text-zinc-950 dark:text-zinc-100">
                        {item.units_sold}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Units</span>
                    </div>
                    <div>
                      <span className="block font-mono font-semibold text-zinc-950 dark:text-zinc-100">
                        {formatCurrency(item.total_sales)}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Revenue</span>
                    </div>
                    <div className="hidden sm:block">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                          item.current_stock <= 5
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {item.current_stock} left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Status Breakdown & Inventory Alerts */}
        <div className="space-y-6">
          {/* Order Status Distribution */}
          <div className="bg-white dark:bg-[#111113] p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg space-y-4">
            <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                Order Status Overview
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fulfillment status distribution
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {statusList.map((s) => {
                const pct = Math.round(((s.count || 0) / totalStatusCount) * 100);
                return (
                  <div key={s.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{s.label}</span>
                      <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums">
                        {s.count}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.bar} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white dark:bg-[#111113] p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg space-y-4">
            <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                Category Performance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Revenue generated by category
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {data.category_performance.length === 0 ? (
                <p className="text-zinc-400 dark:text-zinc-500 py-2">No category revenue yet.</p>
              ) : (
                data.category_performance.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {cat.category_name}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {cat.total_units} units sold
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums shrink-0">
                      {formatCurrency(cat.total_revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Warning Box */}
          {data.low_stock.length > 0 && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Low Inventory Alert ({data.low_stock.length})</span>
              </div>
              <div className="divide-y divide-amber-200/60 dark:divide-amber-900/40 text-xs">
                {data.low_stock.map((prod) => (
                  <div key={prod.id} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="font-medium text-amber-950 dark:text-amber-200 truncate">
                      {prod.name}
                    </span>
                    <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold shrink-0 tabular-nums">
                      {prod.inventory_qty} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
