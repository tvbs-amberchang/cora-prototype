// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Data retention tiers display and query simulator for DataCore

import React, { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function QueryBuilder() {
  const [queryEvent, setQueryEvent] = useState('page_view');
  const [queryDays, setQueryDays] = useState(7);
  const [queryThreshold, setQueryThreshold] = useState(3);

  const queryResult = useMemo(() => {
    const base = 120000;
    const eventFactor = queryEvent === 'page_view' ? 1 : queryEvent === 'video_complete' ? 0.42 : 0.21;
    const dayFactor = Math.min(1.2, queryDays / 30 + 0.2);
    const thresholdFactor = Math.max(0.12, 1 / Math.max(1, queryThreshold));
    return Math.round(base * eventFactor * dayFactor * thresholdFactor);
  }, [queryDays, queryEvent, queryThreshold]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>資料保留分層</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="border border-green-200 bg-green-50 rounded p-3">
            <div className="font-semibold text-green-800">熱資料</div>
            <div className="text-green-700 text-xs mt-1">近 90 天 · 秒級查詢</div>
          </div>
          <div className="border border-primary/20 bg-primary/5 rounded p-3">
            <div className="font-semibold text-ph-blue">溫資料</div>
            <div className="text-ph-blue/80 text-xs mt-1">91 天~1 年 · 數秒級</div>
          </div>
          <div className="border border-border bg-ph-surface rounded p-3">
            <div className="font-semibold text-ph-secondary">冷資料</div>
            <div className="text-ph-muted text-xs mt-1">1 年以上 · 排程查詢</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-ph-secondary">
          預估規模：月 `page_view` 約 1.27 億；尖峰約 500 events/sec（含 scroll）。
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">分群查詢模擬器</h3>
        <div className="space-y-3">
          <select
            value={queryEvent}
            onChange={(e) => setQueryEvent(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm bg-white"
          >
            <option value="page_view">page_view</option>
            <option value="video_complete">video_complete</option>
            <option value="notification_click">notification_click</option>
          </select>
          <label className="text-xs text-ph-secondary block">時間範圍（天）</label>
          <input
            type="range"
            min={1}
            max={90}
            value={queryDays}
            onChange={(e) => setQueryDays(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-ph-muted">近 {queryDays} 天</div>
          <label className="text-xs text-ph-secondary block">事件次數門檻（&gt;=）</label>
          <Input
            type="number"
            min={1}
            value={queryThreshold}
            onChange={(e) => setQueryThreshold(Number(e.target.value) || 1)}
          />
          <div className="border border-border rounded p-3 bg-ph-surface">
            <div className="text-xs text-ph-secondary">預估符合人數</div>
            <div className="text-2xl font-mono font-bold text-ph-text">{queryResult.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
