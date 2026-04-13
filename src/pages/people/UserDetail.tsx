// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: User detail panel — identity, channels, brands, activity summary, send diagnostics

import React from 'react';
import {
  ArrowLeft, Eye, EyeOff, Download, Trash2, Copy,
  User, Mail, Phone, Smartphone, Globe, Send, Activity, Tag,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SearchResult, BRAND_CONFIG, TimelineEvent } from './types';

const BrandBadge = ({ brand }: { brand: string }) => {
  const cfg = BRAND_CONFIG[brand] ?? { label: brand, color: 'bg-ph-surface text-ph-secondary' };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

interface UserDetailProps {
  profile: SearchResult;
  showFullPII: boolean;
  onTogglePII: () => void;
  onBack: () => void;
  filteredEvents: TimelineEvent[];
  topEventType: string;
  topBrand: string;
}

export const UserDetail = ({
  profile,
  showFullPII,
  onTogglePII,
  onBack,
  filteredEvents,
  topEventType,
  topBrand,
}: UserDetailProps) => (
  <div>
    {/* Header actions */}
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-ph-secondary hover:text-ph-text transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回搜尋結果
      </button>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-ph-secondary">
          <Download className="w-4 h-4" />
          匯出資料 (GDPR)
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-ph-danger border-red-200 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
          刪除資料 (GDPR)
        </Button>
      </div>
    </div>

    {/* Identity card */}
    <Card className="mb-6 shadow-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-ph-blue" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ph-text flex items-center gap-3 mb-1">
                {showFullPII ? 'john.doe@gmail.com' : profile.email}
                {profile.member_id && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    已綁定會員
                  </Badge>
                )}
              </h2>
              <div className="text-sm text-ph-secondary flex items-center gap-4">
                <span className="flex items-center gap-1">
                  cora_id:
                  <code className="bg-ph-surface px-1 rounded text-xs">{profile.cora_id}</code>
                  <button className="text-ph-muted hover:text-ph-secondary">
                    <Copy className="w-3 h-3" />
                  </button>
                </span>
                {profile.member_id && (
                  <span className="flex items-center gap-1">
                    member_id:
                    <code className="bg-ph-surface px-1 rounded text-xs">{profile.member_id}</code>
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePII}
            className="text-ph-blue hover:text-ph-blue/80 bg-blue-50 hover:bg-blue-100 gap-1.5"
          >
            {showFullPII ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showFullPII ? '隱藏 PII' : '揭露完整 PII'}
          </Button>
        </div>

        <Separator className="mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & opt-in */}
          <div>
            <h3 className="text-sm font-semibold text-ph-text mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-ph-muted" />
              聯絡方式與同意狀態 (Opt-in)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ph-muted" />
                  <span className="text-ph-secondary w-16">Email</span>
                  <span className="font-medium text-ph-text">
                    {showFullPII ? 'john.doe@gmail.com' : profile.email}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">已同意 (Opt-in)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-ph-muted" />
                  <span className="text-ph-secondary w-16">Phone</span>
                  <span className="font-medium text-ph-text">
                    {profile.phone ? (showFullPII ? '0912345789' : profile.phone) : '無資料'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-ph-secondary">未提供</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-ph-muted" />
                  <span className="text-ph-secondary w-16">App Push</span>
                  <span className="font-medium text-ph-text">2 個裝置</span>
                </div>
                <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">已同意 (Opt-in)</Badge>
              </div>
            </div>
          </div>

          {/* Reachable channels */}
          <div className="bg-ph-surface rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold text-ph-text mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-ph-muted" />
              實際可觸達渠道 (Reachable)
            </h3>
            <p className="text-xs text-ph-secondary mb-4">
              綜合 Opt-in 狀態與技術可達性（如：Token 是否失效）的最終結果。
            </p>
            <div className="flex items-center gap-4">
              {[
                { ch: 'email',    Icon: Mail,       label: 'Email' },
                { ch: 'app_push', Icon: Smartphone, label: 'App Push' },
                { ch: 'phone',    Icon: Phone,      label: 'SMS' },
                { ch: 'web_push', Icon: Globe,      label: 'Web Push' },
              ].map(({ ch, Icon, label }) => {
                const reachable = profile.reachableChannels.includes(ch);
                return (
                  <div key={ch} className={`flex flex-col items-center gap-1 ${reachable ? '' : 'opacity-40 grayscale'}`}>
                    <div className={`w-10 h-10 bg-white border rounded-full flex items-center justify-center shadow-sm ${reachable ? 'border-green-200' : 'border-border'}`}>
                      <Icon className={`w-5 h-5 ${reachable ? 'text-green-600' : 'text-ph-muted'}`} />
                    </div>
                    <span className="text-xs text-ph-secondary">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Activity summary + diagnostics (left column — caller controls layout) */}
    <div className="space-y-6">
      {/* Activity summary */}
      <Card className="shadow-card">
        <CardHeader className="pb-0 pt-5 px-5">
          <h3 className="text-sm font-semibold text-ph-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-ph-blue" />
            最近活動摘要
          </h3>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-4 space-y-4">
          <div>
            <div className="text-xs text-ph-secondary mb-1">最近活躍時間</div>
            <div className="text-sm font-medium text-ph-text">{profile.lastActive}</div>
          </div>
          <div>
            <div className="text-xs text-ph-secondary mb-2">最近活躍 Brand</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.activeBrands.map((b) => <BrandBadge key={b} brand={b} />)}
            </div>
          </div>
          <div>
            <div className="text-xs text-ph-secondary mb-1">近期行為特徵</div>
            <div className="text-sm text-ph-text">高頻閱讀「健康/減重」相關文章，主要透過 iOS App 訪問。</div>
          </div>
          <Separator />
          <div className="text-sm space-y-1">
            <div className="text-ph-secondary">時間窗內事件：<span className="font-semibold text-ph-text">{filteredEvents.length}</span></div>
            <div className="text-ph-secondary">Top 事件：<span className="font-semibold text-ph-text">{topEventType}</span></div>
            <div className="text-ph-secondary flex items-center gap-1">
              Top Brand：{topBrand === '-' ? <span className="font-semibold text-ph-text">-</span> : <BrandBadge brand={topBrand} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send diagnostics */}
      <Card className="shadow-card">
        <CardHeader className="pb-0 pt-5 px-5">
          <h3 className="text-sm font-semibold text-ph-text flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            分群與發送診斷
          </h3>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-4">
          <div className="mb-5">
            <div className="text-xs font-medium text-ph-secondary mb-2 uppercase tracking-wider">目前所屬分群 (Segments)</div>
            <div className="space-y-2">
              <div className="text-sm bg-ph-surface border border-border px-3 py-2 rounded-md text-ph-text">糖尿病活躍讀者</div>
              <div className="text-sm bg-ph-surface border border-border px-3 py-2 rounded-md text-ph-text">健康 2.0 App 活躍用戶</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-ph-secondary mb-2 uppercase tracking-wider">最近發送紀錄</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-ph-success mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-ph-text">健康週報 EDM</div>
                  <div className="text-xs text-ph-secondary">2026-04-06 10:00 · 成功送達</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-ph-danger mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-ph-text">女大週年慶 SMS</div>
                  <div className="text-xs text-ph-secondary mb-1">2026-04-05 15:30 · 發送跳過</div>
                  <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded inline-block">
                    原因：無有效手機號碼
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
