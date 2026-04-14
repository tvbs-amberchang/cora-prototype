// [AI-ASSISTED] by Amber, 2026-04-14
// 功能：Data Core — 資料品質警示 Tab（借鏡 PostHog Ingestion Warnings）

import React, { useState } from 'react';
import { AlertTriangle, Building2, TrendingUp } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type WarningType = 'missing_field' | 'format_error' | 'type_mismatch';

interface QualityWarning {
  id: string;
  type: WarningType;
  eventName: string;
  brand: string;
  description: string;
  firstSeen: string;
  count7d: number;
}

const warningTypeLabel: Record<WarningType, string> = {
  missing_field: '欄位遺漏',
  format_error: '格式錯誤',
  type_mismatch: '型態不符',
};

const warningTypeColors: Record<WarningType, string> = {
  missing_field: 'bg-red-50 text-red-700 border-red-200',
  format_error: 'bg-amber-50 text-amber-700 border-amber-200',
  type_mismatch: 'bg-orange-50 text-orange-700 border-orange-200',
};

const mockWarnings: QualityWarning[] = [
  { id: 'w1', type: 'missing_field', eventName: 'page_view', brand: '食尚玩家', description: '缺少必填欄位 page_title', firstSeen: '2 天前', count7d: 1203 },
  { id: 'w2', type: 'format_error', eventName: 'purchase_completed', brand: '女人我最大', description: 'amount 欄位傳入字串而非數字', firstSeen: '5 天前', count7d: 87 },
  { id: 'w3', type: 'type_mismatch', eventName: 'user_signup', brand: '健康 2.0', description: 'signup_method 值不在允許清單內', firstSeen: '1 天前', count7d: 342 },
  { id: 'w4', type: 'missing_field', eventName: 'button_click', brand: 'TVBS 新聞', description: '缺少必填欄位 click_target', firstSeen: '3 天前', count7d: 2541 },
  { id: 'w5', type: 'format_error', eventName: 'email_opened', brand: '食尚玩家', description: 'campaign_id 格式不符（預期 UUID）', firstSeen: '6 天前', count7d: 19 },
  { id: 'w6', type: 'missing_field', eventName: 'session_start', brand: '健康 2.0', description: '缺少必填欄位 platform', firstSeen: '4 小時前', count7d: 678 },
];

export function DataQualityTab() {
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const brands = [...new Set(mockWarnings.map((w) => w.brand))];

  const filtered = brandFilter === 'all'
    ? mockWarnings
    : mockWarnings.filter((w) => w.brand === brandFilter);

  const totalWarnings = filtered.length;
  const affectedBrands = new Set(filtered.map((w) => w.brand)).size;
  const mostCommonType = (() => {
    const counts: Record<string, number> = {};
    filtered.forEach((w) => { counts[w.type] = (counts[w.type] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? warningTypeLabel[top[0] as WarningType] : '-';
  })();

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ph-text">{totalWarnings}</div>
            <div className="text-xs text-ph-secondary">總警示數</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ph-text">{affectedBrands}</div>
            <div className="text-xs text-ph-secondary">受影響品牌</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ph-text">{mostCommonType}</div>
            <div className="text-xs text-ph-secondary">最常見問題</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="all">全部品牌</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-ph-surface">
              <TableHead>警示類型</TableHead>
              <TableHead>事件名稱</TableHead>
              <TableHead>品牌</TableHead>
              <TableHead>說明</TableHead>
              <TableHead>首次發現</TableHead>
              <TableHead className="text-right">發生次數 (7d)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${warningTypeColors[w.type]}`}>
                    {warningTypeLabel[w.type]}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm text-ph-text">{w.eventName}</TableCell>
                <TableCell className="text-sm text-ph-text">{w.brand}</TableCell>
                <TableCell className="text-sm text-ph-secondary">{w.description}</TableCell>
                <TableCell className="text-sm text-ph-secondary">{w.firstSeen}</TableCell>
                <TableCell className="text-right font-mono text-sm text-ph-text">{w.count7d.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
