// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Dashboard page — extracted from App.tsx. Old styling kept; will be converted in Task 3.

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  Send,
} from 'lucide-react';

const PageHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{title}</h1>
    <p className="text-slate-500 text-sm">{description}</p>
  </div>
);

const KpiCard = ({
  label,
  value,
  sub,
  trend,
  color = 'brand',
}: {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'brand' | 'emerald' | 'amber' | 'violet';
}) => {
  const colorMap = {
    brand: 'from-brand-500 to-brand-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
  };
  const trendColor =
    trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="kpi-card group hover:shadow-card-hover transition-all duration-250">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {trend && (
          <span className={`flex items-center space-x-0.5 ${trendColor}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Activity className="w-3.5 h-3.5" />
            )}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>
        {sub}
      </div>
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]} rounded-t-xl`}
      />
    </div>
  );
};

const ProgressBar = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const AlertItem = ({
  message,
  severity,
}: {
  message: string;
  severity: 'error' | 'warning' | 'info';
}) => {
  const config = {
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
      border: 'border-l-red-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
      border: 'border-l-amber-500',
    },
    info: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-600',
      icon: <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />,
      border: 'border-l-slate-400',
    },
  };
  const c = config[severity];
  return (
    <div
      className={`flex items-center space-x-3 rounded-lg border border-l-4 ${c.border} ${c.bg} px-4 py-3 ${c.text}`}
    >
      {c.icon}
      <span className="text-sm">{message}</span>
    </div>
  );
};

const DashboardPage = () => (
  <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
    <PageHeader title="總覽儀表板" description="全站數據與行銷活動概況" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard label="ID 覆蓋率" value="96.4%" sub="目標 95%（達標）" trend="up" color="brand" />
      <KpiCard
        label="事件入庫延遲 P95"
        value="3.2s"
        sub="Data Core 目標 < 5s"
        trend="up"
        color="emerald"
      />
      <KpiCard
        label="今日活躍分群"
        value="128"
        sub="含 23 個即時更新分群"
        trend="neutral"
        color="violet"
      />
      <KpiCard
        label="進行中旅程"
        value="17"
        sub="啟用上限 50"
        trend="neutral"
        color="amber"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">遞送與活動成效</h3>
          <span className="badge bg-brand-50 text-brand-600">近 24h</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: '發送任務', value: '42', icon: Send },
            { label: '平均送達率', value: '97.1%', icon: TrendingUp },
            { label: '平均點擊率', value: '6.8%', icon: Zap },
            { label: '問卷完成數', value: '5,204', icon: Activity },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 group hover:bg-brand-50/50 hover:border-brand-200 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                <span className="text-slate-500 text-xs">{item.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
          渠道拆分：Push 18 ｜ LINE 9 ｜ SMS 6 ｜ Email 9
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">預算使用率</h3>
          <span className="badge bg-slate-100 text-slate-600">本月</span>
        </div>
        <div className="space-y-5">
          <ProgressBar
            label="SMS"
            value={64}
            color="bg-gradient-to-r from-brand-400 to-brand-600"
          />
          <ProgressBar
            label="LINE"
            value={72}
            color="bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
          <ProgressBar
            label="Email"
            value={24}
            color="bg-gradient-to-r from-amber-400 to-amber-500"
          />
        </div>
      </div>
    </div>

    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-slate-900">系統告警與待處理事項</h3>
        <span className="badge bg-red-50 text-red-600 border border-red-200">3 則待處理</span>
      </div>
      <div className="space-y-3">
        <AlertItem severity="error" message="SMS 主要供應商連續失敗，已切換備援（2 分鐘前）" />
        <AlertItem severity="warning" message="LINE 預算達 72%，接近提醒門檻（80%）" />
        <AlertItem severity="info" message="本日有 3 筆 GDPR Request 仍在處理中" />
      </div>
    </div>
  </div>
);

export default DashboardPage;
