// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Campaign list table with search/filter controls and per-row metrics

import React, { useMemo, useState } from 'react';
import { BarChart3, CalendarCheck, Gift, LayoutTemplate, MessageSquareText, Plus, Search, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  type Brand,
  type Campaign,
  type CampaignContentType,
  type CampaignStatus,
  brandMap,
  typeLabel,
} from './types';

// ---- Status badge mapping ----
const statusVariant: Record<CampaignStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  draft: { variant: 'secondary', label: '草稿' },
  scheduled: { variant: 'secondary', label: '排程中' },
  active: { variant: 'default', label: '進行中' },
  ended: { variant: 'outline', label: '已結束' },
};

const TypeIcon = ({ type }: { type: CampaignContentType }) => {
  if (type === 'card') return <LayoutTemplate className="w-4 h-4 text-amber-500" />;
  if (type === 'survey') return <MessageSquareText className="w-4 h-4 text-blue-500" />;
  if (type === 'lottery') return <Gift className="w-4 h-4 text-purple-500" />;
  return <CalendarCheck className="w-4 h-4 text-green-500" />;
};

interface CampaignListProps {
  campaigns: Campaign[];
  onCreateNew: () => void;
  onEdit: (campaign: Campaign) => void;
  onInspect: (campaign: Campaign) => void;
  onConfigPreview: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onCreateNew, onEdit, onInspect, onConfigPreview }: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<Brand | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignContentType | 'all'>('all');

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const bySearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const byStatus = statusFilter === 'all' || c.status === statusFilter;
        const byBrand = brandFilter === 'all' || c.brand === brandFilter;
        const byType = typeFilter === 'all' || c.contentType === typeFilter;
        return bySearch && byStatus && byBrand && byType;
      }),
    [campaigns, searchQuery, statusFilter, brandFilter, typeFilter],
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <Button onClick={onCreateNew} size="sm" className="flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          建立行銷活動
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋活動名稱..."
              className="pl-9 w-52 h-8 text-sm"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value as Brand | 'all')}
            className="h-8 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
          >
            <option value="all">全部 Brand</option>
            <option value="health">健康 2.0</option>
            <option value="supertaste">食尚玩家</option>
            <option value="woman">女人我最大</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CampaignContentType | 'all')}
            className="h-8 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
          >
            <option value="all">全部類型</option>
            <option value="card">卡片</option>
            <option value="survey">問卷</option>
            <option value="lottery">抽獎</option>
            <option value="checkin">簽到</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
            className="h-8 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
          >
            <option value="all">全部狀態</option>
            <option value="draft">草稿</option>
            <option value="scheduled">排程中</option>
            <option value="active">進行中</option>
            <option value="ended">已結束</option>
          </select>
        </div>
      </div>

      {/* Campaign cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((campaign) => (
          <Card key={campaign.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TypeIcon type={campaign.contentType} />
                    <h3 className="font-semibold text-ph-text text-sm">{campaign.name}</h3>
                    <Badge variant={statusVariant[campaign.status].variant}>
                      {statusVariant[campaign.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-ph-secondary">
                    {brandMap[campaign.brand]} · {campaign.moduleType === 'inline' ? 'Inline 模組' : 'Popup 模組'} · {typeLabel(campaign.contentType)}
                  </p>
                  <p className="text-xs text-ph-muted">
                    排程：{campaign.startAt.replace('T', ' ')} ~ {campaign.endAt.replace('T', ' ')} · GA4：{campaign.ga4Sync ? '已開啟' : '關閉'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => onConfigPreview(campaign)}>
                    設定預覽
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onInspect(campaign)} className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    成效
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(campaign)}>
                    編輯
                  </Button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="bg-ph-surface border border-border rounded-md p-3 text-sm">
                  <div className="text-ph-secondary text-xs mb-1">曝光數</div>
                  <div className="font-semibold text-ph-text">{campaign.metrics.impressions.toLocaleString()}</div>
                </div>
                <div className="bg-ph-surface border border-border rounded-md p-3 text-sm">
                  <div className="text-ph-secondary text-xs mb-1">互動數</div>
                  <div className="font-semibold text-ph-text">{campaign.metrics.interactions.toLocaleString()}</div>
                </div>
                <div className="bg-ph-surface border border-border rounded-md p-3 text-sm">
                  <div className="text-ph-secondary text-xs mb-1">完成數</div>
                  <div className="font-semibold text-ph-text">{campaign.metrics.completions.toLocaleString()}</div>
                </div>
              </div>

              {/* Prize stock for lottery */}
              {campaign.contentType === 'lottery' && campaign.prizes && (
                <div className="mt-2 text-xs text-ph-secondary">
                  獎品庫存：{campaign.prizes.map((p) => `${p.name} ${p.remaining}/${p.stock}`).join(' ｜ ')}
                </div>
              )}

              {/* Triggers summary */}
              {campaign.triggers.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-ph-muted">
                  <Target className="w-3 h-3" />
                  {campaign.triggers.join(' AND ')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-ph-secondary text-sm">
            沒有符合條件的活動
          </div>
        )}
      </div>
    </div>
  );
}
