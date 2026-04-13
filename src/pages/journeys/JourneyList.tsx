// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Journey list table + stats — PostHog style

import React from 'react';
import { Plus, Search, Workflow } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

type JourneyStatus = 'draft' | 'active' | 'paused' | 'ended';
type TriggerType = 'event' | 'attribute' | 'schedule' | 'segment_enter';

export interface Journey {
  id: string;
  name: string;
  triggerType: TriggerType;
  status: JourneyStatus;
  enteredCount: number;
  inProgressCount: number;
  completedCount: number;
  failedCount: number;
  updatedAt: string;
  startedAt?: string;
}

interface JourneyListProps {
  journeys: Journey[];
  searchQuery: string;
  statusFilter: JourneyStatus | 'all';
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (s: JourneyStatus | 'all') => void;
  onCreateJourney: () => void;
  onSetupJourney: (journey: Journey) => void;
  onOpenCanvas: (journey: Journey) => void;
}

const StatusBadge = ({ status }: { status: JourneyStatus }) => {
  const config: Record<JourneyStatus, { label: string; className: string }> = {
    draft: { label: '草稿', className: 'bg-ph-surface text-ph-secondary border border-border' },
    active: { label: '啟用中', className: 'bg-green-100 text-green-700 border border-green-200' },
    paused: { label: '已暫停', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    ended: { label: '已結束', className: 'bg-ph-surface text-ph-muted border border-border' },
  };
  const { label, className } = config[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

const TriggerBadge = ({ triggerType }: { triggerType: TriggerType }) => {
  const label =
    triggerType === 'event' ? '行為觸發' :
    triggerType === 'attribute' ? '屬性觸發' :
    triggerType === 'schedule' ? '排程觸發' :
    '分群進入觸發';
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-ph-surface text-ph-secondary border border-border">
      {label}
    </span>
  );
};

export function JourneyList({
  journeys,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreateJourney,
  onSetupJourney,
  onOpenCanvas,
}: JourneyListProps) {
  const filtered = journeys.filter((j) => {
    const matchesSearch = j.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader title="自動化旅程" description="視覺化編排用戶行銷旅程，在對的時機觸發對的動作" />

      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <button
            onClick={onCreateJourney}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-ph-text text-white rounded-md text-sm font-medium hover:bg-ph-text/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>建立旅程</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋旅程名稱..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 w-64 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as JourneyStatus | 'all')}
              className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 text-ph-text"
            >
              <option value="all">全部狀態</option>
              <option value="active">啟用中</option>
              <option value="draft">草稿</option>
              <option value="paused">已暫停</option>
              <option value="ended">已結束</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ph-surface border-b border-border text-ph-secondary">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">旅程名稱</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium text-right">總進入</th>
                <th className="px-4 py-3 font-medium text-right">目前在途</th>
                <th className="px-4 py-3 font-medium text-right">已完成</th>
                <th className="px-4 py-3 font-medium">最後更新</th>
                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((journey) => (
                <tr key={journey.id} className="hover:bg-ph-surface transition-colors group">
                  <td className="px-4 py-4">
                    <div className="font-medium text-ph-text flex items-center space-x-2">
                      <Workflow className="w-4 h-4 text-ph-muted" />
                      <span>{journey.name}</span>
                      <TriggerBadge triggerType={journey.triggerType} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={journey.status} />
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-ph-text">
                    {journey.enteredCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-brand-500 font-medium">
                    {journey.inProgressCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-green-600 font-medium">
                    {journey.completedCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-ph-secondary">
                    {journey.updatedAt}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      {journey.status === 'draft' && (
                        <button
                          onClick={() => onSetupJourney(journey)}
                          className="text-ph-text hover:text-ph-text/80 font-medium px-3 py-1.5 rounded-md hover:bg-ph-surface transition-colors text-sm"
                        >
                          設定旅程
                        </button>
                      )}
                      <button
                        onClick={() => onOpenCanvas(journey)}
                        className="text-brand-500 hover:text-brand-600 font-medium px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors text-sm"
                      >
                        開啟畫布
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-ph-muted mx-auto mb-3" />
              <p className="text-ph-secondary">找不到符合條件的旅程</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
