// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Budget tab — channel budget table with usage progress bars

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

type Channel = 'push' | 'line' | 'sms' | 'email';

interface BudgetRow {
  channel: Channel;
  cycle: 'monthly' | 'quarterly';
  total: number;
  used: number;
  brandAllocations: Array<{ brand: string; amount: number }>;
  enabled: boolean;
}

const channelLabel: Record<Channel, string> = {
  push: 'App Push',
  line: 'LINE OA',
  sms: 'SMS',
  email: 'Email',
};

const initialBudgets: BudgetRow[] = [
  {
    channel: 'line',
    cycle: 'monthly',
    total: 120000,
    used: 86400,
    enabled: true,
    brandAllocations: [
      { brand: 'health', amount: 40000 },
      { brand: 'supertaste', amount: 30000 },
      { brand: 'woman', amount: 30000 },
      { brand: '共用池', amount: 20000 },
    ],
  },
  {
    channel: 'sms',
    cycle: 'monthly',
    total: 100000,
    used: 64000,
    enabled: true,
    brandAllocations: [
      { brand: 'health', amount: 30000 },
      { brand: 'supertaste', amount: 20000 },
      { brand: 'woman', amount: 30000 },
      { brand: '共用池', amount: 20000 },
    ],
  },
  {
    channel: 'email',
    cycle: 'monthly',
    total: 50000,
    used: 12000,
    enabled: false,
    brandAllocations: [
      { brand: 'health', amount: 15000 },
      { brand: 'supertaste', amount: 15000 },
      { brand: 'woman', amount: 20000 },
    ],
  },
];

export default function BudgetTab() {
  const [budgets, setBudgets] = useState<BudgetRow[]>(initialBudgets);
  const [budgetWarn, setBudgetWarn] = useState(80);
  const [budgetCritical, setBudgetCritical] = useState(100);

  return (
    <div className="space-y-6">
      {/* Budget rows */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4">渠道預算與 brand 分配</h3>
        <div className="space-y-4">
          {budgets.map((row, idx) => {
            const pct = Math.round((row.used / Math.max(1, row.total)) * 100);
            const barColor = pct >= budgetCritical ? 'bg-red-500' : pct >= budgetWarn ? 'bg-yellow-500' : 'bg-green-500';

            return (
              <div key={row.channel} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-ph-text">{channelLabel[row.channel]}</div>
                  <label className="flex items-center gap-2 text-sm text-ph-secondary cursor-pointer">
                    <span>啟用</span>
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) =>
                        setBudgets((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, enabled: e.target.checked } : item
                          )
                        )
                      }
                    />
                  </label>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-ph-secondary mb-1">
                    <span>使用量：{row.used.toLocaleString()} / {row.total.toLocaleString()}</span>
                    <span className="font-mono font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 bg-ph-surface rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <label className="block">
                    <span className="text-ph-secondary">總預算</span>
                    <input
                      type="number"
                      value={row.total}
                      onChange={(e) =>
                        setBudgets((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, total: Number(e.target.value) || 0 } : item
                          )
                        )
                      }
                      className="mt-1 w-full px-2 py-1 border border-border rounded text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-ph-secondary">已用</span>
                    <input
                      type="number"
                      value={row.used}
                      onChange={(e) =>
                        setBudgets((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, used: Number(e.target.value) || 0 } : item
                          )
                        )
                      }
                      className="mt-1 w-full px-2 py-1 border border-border rounded text-sm"
                    />
                  </label>
                  <div>
                    <span className="text-ph-secondary">使用率</span>
                    <div className="mt-1 font-mono text-sm font-medium text-ph-text">{pct}%</div>
                  </div>
                </div>

                <div className="text-xs text-ph-secondary">
                  分配：{row.brandAllocations.map((a) => `${a.brand} ${a.amount.toLocaleString()}`).join(' ｜ ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert thresholds */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4">告警門檻</h3>
        <div className="space-y-3">
          <label className="block text-sm text-ph-text">
            提醒門檻（%）
            <Input
              type="number"
              value={budgetWarn}
              onChange={(e) => setBudgetWarn(Number(e.target.value) || 0)}
              className="mt-1"
            />
          </label>
          <label className="block text-sm text-ph-text">
            緊急門檻（%）
            <Input
              type="number"
              value={budgetCritical}
              onChange={(e) => setBudgetCritical(Number(e.target.value) || 0)}
              className="mt-1"
            />
          </label>
          <div className="text-xs text-ph-secondary bg-ph-surface border border-border rounded-md p-3">
            預算設定/分配由 System Admin 管；發送時攔截邏輯由 Delivery Core 執行。
          </div>
        </div>
      </div>
    </div>
  );
}
