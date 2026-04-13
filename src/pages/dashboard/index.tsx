// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Dashboard page — PostHog style using shadcn Card, Badge, Alert + sub-components

import React from 'react';
import { Activity, Send, TrendingUp, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import KpiCard from './KpiCard';
import AlertsSection from './AlertsSection';

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
      <span className="text-sm text-ph-text font-medium">{label}</span>
      <span className="text-sm font-semibold text-ph-text">{value}%</span>
    </div>
    <div className="h-2 bg-ph-surface rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const stats = [
  { label: '發送任務', value: '42', icon: Send },
  { label: '平均送達率', value: '97.1%', icon: TrendingUp },
  { label: '平均點擊率', value: '6.8%', icon: Zap },
  { label: '問卷完成數', value: '5,204', icon: Activity },
];

const alerts = [
  { severity: 'error' as const, message: 'SMS 主要供應商連續失敗，已切換備援（2 分鐘前）' },
  { severity: 'warning' as const, message: 'LINE 預算達 72%，接近提醒門檻（80%）' },
  { severity: 'info' as const, message: '本日有 3 筆 GDPR Request 仍在處理中' },
];

const DashboardPage = () => (
  <div className="p-6 md:p-8 ">
    <PageHeader title="總覽儀表板" description="全站數據與行銷活動概況" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard label="ID 覆蓋率" value="96.4%" sub="目標 95%（達標）" trend="up" />
      <KpiCard label="事件入庫延遲 P95" value="3.2s" sub="Data Core 目標 < 5s" trend="up" />
      <KpiCard label="今日活躍分群" value="128" sub="含 23 個即時更新分群" trend="neutral" />
      <KpiCard label="進行中旅程" value="17" sub="啟用上限 50" trend="neutral" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-ph-text">遞送與活動成效</CardTitle>
            <Badge variant="secondary">近 24h</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {stats.map((item) => (
              <div
                key={item.label}
                className="border border-border rounded-xl p-4 bg-ph-surface group hover:border-border transition-colors duration-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <item.icon className="w-3.5 h-3.5 text-ph-muted" />
                  <span className="text-ph-secondary text-xs">{item.label}</span>
                </div>
                <div className="text-xl font-bold text-ph-text">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border text-xs text-ph-muted">
            渠道拆分：Push 18 ｜ LINE 9 ｜ SMS 6 ｜ Email 9
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-ph-text">預算使用率</CardTitle>
            <Badge variant="outline">本月</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <ProgressBar label="SMS" value={64} color="bg-ph-blue" />
            <ProgressBar label="LINE" value={72} color="bg-ph-success" />
            <ProgressBar label="Email" value={24} color="bg-ph-warning" />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-ph-text">系統告警與待處理事項</CardTitle>
          <Badge variant="destructive">3 則待處理</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <AlertsSection alerts={alerts} />
      </CardContent>
    </Card>
  </div>
);

export default DashboardPage;
