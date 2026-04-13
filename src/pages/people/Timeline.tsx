// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Event timeline component with date grouping, filters, and key-event flag

import React from 'react';
import { Clock, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineEvent, TimeRange, BRAND_CONFIG } from './types';

const BrandBadge = ({ brand }: { brand: string }) => {
  const cfg = BRAND_CONFIG[brand] ?? { label: brand, color: 'bg-ph-surface text-ph-secondary' };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

interface TimelineProps {
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  eventTypeFilter: string;
  onEventTypeFilterChange: (t: string) => void;
  brandFilter: string;
  onBrandFilterChange: (b: string) => void;
  importantOnly: boolean;
  onImportantOnlyChange: (v: boolean) => void;
  eventTypeOptions: string[];
  brandOptions: string[];
  groupedVisibleEvents: [string, TimelineEvent[]][];
  visibleCount: number;
  filteredEventsTotal: number;
  visibleEventsTotal: number;
  collapsedDateGroups: Record<string, boolean>;
  onToggleDateGroup: (dateKey: string) => void;
  onLoadMore: () => void;
}

export const Timeline = ({
  timeRange,
  onTimeRangeChange,
  eventTypeFilter,
  onEventTypeFilterChange,
  brandFilter,
  onBrandFilterChange,
  importantOnly,
  onImportantOnlyChange,
  eventTypeOptions,
  brandOptions,
  groupedVisibleEvents,
  visibleCount,
  filteredEventsTotal,
  visibleEventsTotal,
  collapsedDateGroups,
  onToggleDateGroup,
  onLoadMore,
}: TimelineProps) => (
  <Card className="shadow-card h-full">
    <CardContent className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-ph-text flex items-center gap-2">
          <Clock className="w-4 h-4 text-ph-secondary" />
          完整事件時間線 (Data Core)
        </h3>
        <span className="text-xs text-ph-muted">
          顯示 {visibleEventsTotal} / {filteredEventsTotal} 筆
        </span>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-2">
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white focus:outline-none focus:ring-1 focus:ring-ph-blue"
        >
          <option value="24h">近 24 小時</option>
          <option value="7d">近 7 天</option>
          <option value="30d">近 30 天</option>
        </select>

        <select
          value={eventTypeFilter}
          onChange={(e) => onEventTypeFilterChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white focus:outline-none focus:ring-1 focus:ring-ph-blue"
        >
          <option value="all">全部事件類型</option>
          {eventTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => onBrandFilterChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white focus:outline-none focus:ring-1 focus:ring-ph-blue"
        >
          <option value="all">全部 Brand</option>
          {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <label className="md:col-span-2 flex items-center justify-between border border-border rounded-md px-3 py-2 text-sm text-ph-text cursor-pointer hover:bg-ph-surface/50 transition-colors">
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ph-muted" />
            僅看關鍵事件
          </span>
          <input
            type="checkbox"
            checked={importantOnly}
            onChange={(e) => onImportantOnlyChange(e.target.checked)}
            className="accent-ph-blue"
          />
        </label>
      </div>

      {/* Empty state */}
      {groupedVisibleEvents.length === 0 && (
        <div className="text-sm text-ph-secondary bg-ph-surface border border-border rounded-lg p-4">
          這個時間窗沒有符合條件的事件，請調整篩選條件。
        </div>
      )}

      {/* Event groups */}
      {groupedVisibleEvents.length > 0 && (
        <div className="space-y-4 pb-2">
          {groupedVisibleEvents.map(([dateKey, events]) => (
            <div key={dateKey} className="border border-border rounded-lg p-3">
              <button
                onClick={() => onToggleDateGroup(dateKey)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-ph-text">
                  {dateKey}（{events.length} 筆）
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-ph-muted transition-transform ${
                    collapsedDateGroups[dateKey] ? '' : 'rotate-90'
                  }`}
                />
              </button>

              {!collapsedDateGroups[dateKey] && (
                <div className="relative border-l-2 border-border ml-2 mt-3 space-y-5">
                  {events.map((event) => (
                    <div key={event.id} className="relative pl-5">
                      {/* Timeline dot */}
                      <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-ph-blue" />

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-ph-text">{event.type}</span>
                        <BrandBadge brand={event.brand} />
                        {event.isKeyEvent && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-ph-blue rounded font-medium">
                            key
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-ph-secondary mb-1">{event.detail}</div>
                      <div className="text-xs text-ph-muted">{event.timestamp.replace('T', ' ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {visibleCount < filteredEventsTotal && (
        <div className="pt-3">
          <button
            onClick={onLoadMore}
            className="text-sm text-ph-blue hover:text-ph-blue/80 font-medium"
          >
            載入更多事件（+10）
          </button>
        </div>
      )}
    </CardContent>
  </Card>
);
