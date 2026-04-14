// [AI-ASSISTED] by Amber, 2026-04-14
// 功能：Data Core — 事件目錄（對齊 PRD-003 16 個標準事件）、SDK 追蹤矩陣、屬性管理、自訂事件

import React, { useMemo, useState } from 'react';
import {
  Eye, MousePointerClick, ScrollText, Search, Play, CheckCircle,
  Share2, Send, PackageCheck, AlertCircle, Bell, Mail, MailOpen,
  MailX, Smartphone, Download, Database, ShieldCheck, Clock3,
  Filter, Tags, CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ── Types ───────────────────────────────────────────────────────────────────

type EventCategory = '頁面瀏覽' | '互動行為' | '內容消費' | '發送狀態' | '渠道回應' | 'App 生命週期';
type TriggerMode = '自動' | '手動' | '系統';
type EventStatus = 'Active' | 'Paused';

interface EventParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface EventDef {
  name: string;
  category: EventCategory;
  triggerMode: TriggerMode;
  status: EventStatus;
  verified: boolean;
  lastTriggered: string;
  volume7d: string;
  icon: React.ElementType;
  description: string;
  triggerCondition: string;
  params: EventParam[];
}

type PropertyType = 'event' | 'user' | 'content';

interface PropertyDef {
  displayName: string;
  code: string;
  dataType: string;
  propertyType: PropertyType;
  source: string;
  metaTag?: string;
}

interface CustomEventRequest {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  status: 'draft' | 'review' | 'approved';
}

// ── Common fields (shown in expanded detail) ────────────────────────────────

const commonRequiredFields = [
  { name: 'cora_id', type: 'string' },
  { name: 'session_id', type: 'string' },
  { name: 'platform', type: 'string' },
  { name: 'brand', type: 'string' },
  { name: 'created_at', type: 'datetime' },
  { name: 'event_id', type: 'uuid' },
];

// ── PRD-003 §3: 16 Standard Events ─────────────────────────────────────────

const eventCatalog: EventDef[] = [
  // §3.2 頁面瀏覽
  {
    name: 'page_view', category: '頁面瀏覽', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '2 分鐘前', volume7d: '8.9M', icon: Eye,
    description: '頁面載入事件（含內容屬性）',
    triggerCondition: '頁面載入完成（Web: DOMContentLoaded；App: 畫面可見）',
    params: [
      { name: 'page_url', type: 'string', required: true, description: '完整 URL' },
      { name: 'page_title', type: 'string', required: true, description: '頁面標題' },
      { name: 'page_referrer', type: 'string', required: false, description: '前一頁 URL' },
      { name: 'page_type', type: 'string', required: false, description: '頁面類型：article / index / category / search / other' },
      { name: 'content_*', type: '—', required: false, description: '文章頁自動帶入內容屬性（見屬性管理）' },
    ],
  },
  // §3.3 互動行為
  {
    name: 'click', category: '互動行為', triggerMode: '手動', status: 'Active', verified: true,
    lastTriggered: '5 分鐘前', volume7d: '2.1M', icon: MousePointerClick,
    description: '關鍵 CTA 點擊追蹤',
    triggerCondition: '用戶點擊被標記為需追蹤的 UI 元素',
    params: [
      { name: 'click_target', type: 'string', required: true, description: '點擊元素識別名稱，如 cta_subscribe' },
      { name: 'click_url', type: 'string', required: false, description: '目標 URL' },
      { name: 'click_position', type: 'string', required: false, description: '元素位置，如 header / sidebar' },
    ],
  },
  {
    name: 'scroll', category: '互動行為', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '1 分鐘前', volume7d: '26.7M', icon: ScrollText,
    description: '25/50/75/100 深度里程碑',
    triggerCondition: '頁面捲動到達 25% / 50% / 75% / 100% 深度門檻，每門檻每次造訪只觸發一次',
    params: [
      { name: 'scroll_depth', type: 'number', required: true, description: '達到的深度百分比：25 / 50 / 75 / 100' },
      { name: 'page_url', type: 'string', required: true, description: '當前頁面 URL' },
    ],
  },
  {
    name: 'search', category: '互動行為', triggerMode: '手動', status: 'Active', verified: false,
    lastTriggered: '15 分鐘前', volume7d: '89.1K', icon: Search,
    description: '站內搜尋送出',
    triggerCondition: '用戶送出站內搜尋',
    params: [
      { name: 'search_query', type: 'string', required: true, description: '搜尋關鍵字' },
      { name: 'search_results_count', type: 'number', required: false, description: '搜尋結果數量' },
    ],
  },
  // §3.4 內容消費
  {
    name: 'video_play', category: '內容消費', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '8 分鐘前', volume7d: '1.5M', icon: Play,
    description: '影音開始播放',
    triggerCondition: '影片從暫停/未播放變為播放中（含首次播放和繼續）',
    params: [
      { name: 'video_id', type: 'string', required: true, description: '影片唯一識別' },
      { name: 'video_title', type: 'string', required: true, description: '影片標題' },
      { name: 'video_duration_sec', type: 'number', required: false, description: '影片總長度（秒）' },
      { name: 'video_current_sec', type: 'number', required: false, description: '當前播放位置（秒）' },
    ],
  },
  {
    name: 'video_complete', category: '內容消費', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '20 分鐘前', volume7d: '630K', icon: CheckCircle,
    description: '播放達 95%',
    triggerCondition: '播放進度 ≥ 95%（容許拖動跳轉後觸發）',
    params: [
      { name: 'video_id', type: 'string', required: true, description: '影片唯一識別' },
      { name: 'video_title', type: 'string', required: true, description: '影片標題' },
      { name: 'video_duration_sec', type: 'number', required: false, description: '影片總長度' },
    ],
  },
  {
    name: 'article_share', category: '內容消費', triggerMode: '手動', status: 'Active', verified: false,
    lastTriggered: '45 分鐘前', volume7d: '156K', icon: Share2,
    description: '文章分享',
    triggerCondition: '用戶點擊站內的分享按鈕',
    params: [
      { name: 'share_channel', type: 'string', required: true, description: '分享到哪裡：facebook / line / twitter / copy_link' },
      { name: 'page_url', type: 'string', required: true, description: '被分享的頁面 URL' },
    ],
  },
  // §3.5 發送狀態
  {
    name: 'message_sent', category: '發送狀態', triggerMode: '系統', status: 'Active', verified: true,
    lastTriggered: '3 分鐘前', volume7d: '480K', icon: Send,
    description: '訊息成功送出至服務商',
    triggerCondition: 'Delivery Core 成功將訊息送出至 APNs / FCM / LINE API / SMS / ESP',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'app_push / line / sms / email' },
      { name: 'task_id', type: 'string', required: true, description: '發送任務 ID' },
      { name: 'template_id', type: 'string', required: true, description: '訊息範本 ID' },
    ],
  },
  {
    name: 'message_delivered', category: '發送狀態', triggerMode: '系統', status: 'Active', verified: true,
    lastTriggered: '3 分鐘前', volume7d: '465K', icon: PackageCheck,
    description: '服務商回報送達',
    triggerCondition: '服務商確認訊息已送達用戶裝置',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'app_push / line / sms / email' },
      { name: 'task_id', type: 'string', required: true, description: '發送任務 ID' },
    ],
  },
  {
    name: 'message_failed', category: '發送狀態', triggerMode: '系統', status: 'Active', verified: true,
    lastTriggered: '12 分鐘前', volume7d: '15.2K', icon: AlertCircle,
    description: '遞送失敗',
    triggerCondition: '服務商回報發送失敗或逾時',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'app_push / line / sms / email' },
      { name: 'task_id', type: 'string', required: true, description: '發送任務 ID' },
      { name: 'error_code', type: 'string', required: true, description: '失敗原因代碼，如 invalid_token' },
    ],
  },
  // §3.6 渠道回應
  {
    name: 'notification_click', category: '渠道回應', triggerMode: '系統', status: 'Active', verified: false,
    lastTriggered: '10 分鐘前', volume7d: '210K', icon: Bell,
    description: '用戶點擊推播通知',
    triggerCondition: '用戶點擊 App Push / LINE / SMS 中的連結',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'app_push / line / sms' },
      { name: 'campaign_id', type: 'string', required: true, description: '行銷活動 ID' },
      { name: 'message_id', type: 'string', required: true, description: '訊息 ID' },
    ],
  },
  {
    name: 'email_click', category: '渠道回應', triggerMode: '系統', status: 'Active', verified: true,
    lastTriggered: '25 分鐘前', volume7d: '98K', icon: Mail,
    description: 'Email 連結點擊（成效主指標）',
    triggerCondition: '用戶點擊 Email 中的追蹤連結（redirect 追蹤）',
    params: [
      { name: 'campaign_id', type: 'string', required: true, description: '行銷活動 ID' },
      { name: 'message_id', type: 'string', required: true, description: '訊息 ID' },
      { name: 'click_url', type: 'string', required: true, description: '用戶點擊的目標 URL' },
    ],
  },
  {
    name: 'email_open', category: '渠道回應', triggerMode: '系統', status: 'Active', verified: false,
    lastTriggered: '8 分鐘前', volume7d: '320K', icon: MailOpen,
    description: 'Email 追蹤像素載入（僅趨勢參考，含機器開信）',
    triggerCondition: 'Email 中的 1×1 追蹤像素被載入',
    params: [
      { name: 'campaign_id', type: 'string', required: true, description: '行銷活動 ID' },
      { name: 'message_id', type: 'string', required: true, description: '訊息 ID' },
    ],
  },
  {
    name: 'email_unsubscribe', category: '渠道回應', triggerMode: '系統', status: 'Active', verified: true,
    lastTriggered: '2 小時前', volume7d: '3.2K', icon: MailX,
    description: 'Email 退訂（同步更新 opt-in 狀態）',
    triggerCondition: '用戶點擊 Email 中的退訂連結',
    params: [
      { name: 'campaign_id', type: 'string', required: true, description: '行銷活動 ID' },
      { name: 'message_id', type: 'string', required: true, description: '訊息 ID' },
    ],
  },
  // §3.7 App 生命週期
  {
    name: 'app_open', category: 'App 生命週期', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '1 分鐘前', volume7d: '3.8M', icon: Smartphone,
    description: 'App 冷啟動/回前景',
    triggerCondition: 'App 從冷啟動或背景回到前景',
    params: [
      { name: 'open_source', type: 'string', required: true, description: 'cold_start / background / notification' },
      { name: 'app_version', type: 'string', required: true, description: 'App 版本號' },
    ],
  },
  {
    name: 'app_install', category: 'App 生命週期', triggerMode: '自動', status: 'Active', verified: true,
    lastTriggered: '3 小時前', volume7d: '18.5K', icon: Download,
    description: 'App 首次安裝開啟',
    triggerCondition: 'App 安裝後首次開啟（本機無 CORA 記錄），僅觸發一次',
    params: [
      { name: 'app_version', type: 'string', required: true, description: 'App 版本號' },
      { name: 'os_version', type: 'string', required: true, description: '作業系統版本' },
    ],
  },
];

const categoryColors: Record<EventCategory, string> = {
  '頁面瀏覽': 'bg-sky-50 text-sky-700 border-sky-200',
  '互動行為': 'bg-blue-50 text-blue-700 border-blue-200',
  '內容消費': 'bg-violet-50 text-violet-700 border-violet-200',
  '發送狀態': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '渠道回應': 'bg-amber-50 text-amber-700 border-amber-200',
  'App 生命週期': 'bg-rose-50 text-rose-700 border-rose-200',
};

const triggerModeColors: Record<TriggerMode, string> = {
  '自動': 'bg-green-50 text-green-700 border-green-200',
  '手動': 'bg-orange-50 text-orange-700 border-orange-200',
  '系統': 'bg-gray-100 text-gray-600 border-gray-200',
};

// ── PRD-003 §4 + §8: Properties ─────────────────────────────────────────────

const propertiesCatalog: PropertyDef[] = [
  // §4.2 Content properties (from Meta Tags)
  { displayName: '文章主分類', code: 'content_category', dataType: 'string', propertyType: 'content', source: 'meta_tag', metaTag: 'article:section' },
  { displayName: '文章標籤', code: 'content_tags', dataType: 'array', propertyType: 'content', source: 'meta_tag', metaTag: 'article:tag' },
  { displayName: '作者', code: 'content_author', dataType: 'string', propertyType: 'content', source: 'meta_tag', metaTag: 'article:author' },
  { displayName: '發佈時間', code: 'content_published_at', dataType: 'datetime', propertyType: 'content', source: 'meta_tag', metaTag: 'article:published_time' },
  { displayName: '文章識別', code: 'content_id', dataType: 'string', propertyType: 'content', source: 'meta_tag', metaTag: 'og:url' },
  { displayName: '文章標題', code: 'content_title', dataType: 'string', propertyType: 'content', source: 'meta_tag', metaTag: 'og:title' },
  // §8.1 User attributes
  { displayName: '性別', code: 'gender', dataType: 'string', propertyType: 'user', source: 'cdp_sync' },
  { displayName: '興趣偏好', code: 'interest', dataType: 'array', propertyType: 'user', source: 'system' },
  { displayName: '會員等級', code: 'membership_level', dataType: 'string', propertyType: 'user', source: 'csv_upload' },
  { displayName: '城市', code: 'city', dataType: 'string', propertyType: 'user', source: 'cdp_sync' },
  // Event properties (common across events)
  { displayName: '點擊目標', code: 'click_target', dataType: 'string', propertyType: 'event', source: 'sdk' },
  { displayName: '頁面網址', code: 'page_url', dataType: 'string', propertyType: 'event', source: 'sdk' },
  { displayName: '頁面標題', code: 'page_title', dataType: 'string', propertyType: 'event', source: 'sdk' },
  { displayName: '搜尋關鍵字', code: 'search_query', dataType: 'string', propertyType: 'event', source: 'sdk' },
  { displayName: '捲動深度', code: 'scroll_depth', dataType: 'number', propertyType: 'event', source: 'sdk' },
  { displayName: '影片 ID', code: 'video_id', dataType: 'string', propertyType: 'event', source: 'sdk' },
  { displayName: '渠道', code: 'channel', dataType: 'string', propertyType: 'event', source: 'system' },
  { displayName: '活動 ID', code: 'campaign_id', dataType: 'string', propertyType: 'event', source: 'system' },
];

const propertyTypeLabel: Record<PropertyType, string> = {
  event: '事件屬性',
  user: '用戶屬性',
  content: '內容屬性',
};

const propertyTypeColors: Record<PropertyType, string> = {
  event: 'bg-blue-50 text-blue-700 border-blue-200',
  user: 'bg-violet-50 text-violet-700 border-violet-200',
  content: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ── PRD-003 §6.1: SDK Matrix ────────────────────────────────────────────────

const sdkMatrix = [
  { event: 'page_view', web: '自動', app: '自動', mode: '自動', note: 'SDK 內建' },
  { event: 'scroll', web: '自動', app: '自動', mode: '自動', note: 'SDK 內建，25/50/75/100 門檻' },
  { event: 'click', web: '手動', app: '手動', mode: '手動', note: '需標記追蹤元素' },
  { event: 'search', web: '手動', app: '手動', mode: '手動', note: '搜尋送出時呼叫 SDK' },
  { event: 'video_play', web: '自動', app: '自動', mode: '自動', note: 'SDK 自動偵測播放器' },
  { event: 'video_complete', web: '自動', app: '自動', mode: '自動', note: '播放進度 ≥ 95%' },
  { event: 'article_share', web: '手動', app: '手動', mode: '手動', note: '分享按鈕埋點' },
  { event: 'notification_click', web: '—', app: '自動', mode: '系統', note: 'App SDK 偵測從通知開啟' },
  { event: 'email_*', web: '—', app: '—', mode: '系統', note: 'Delivery 系統自動產生' },
  { event: 'app_open', web: '—', app: '自動', mode: '自動', note: 'App SDK 內建' },
  { event: 'app_install', web: '—', app: '自動', mode: '自動', note: 'App SDK 內建，僅一次' },
  { event: '內容屬性擷取', web: '自動', app: '—', mode: '自動', note: 'Web SDK 自動讀取 Meta Tag' },
  { event: '自訂事件', web: '手動', app: '手動', mode: '手動', note: '依事件定義埋點' },
];

// ── Custom events ───────────────────────────────────────────────────────────

const initialCustomRequests: CustomEventRequest[] = [
  { id: 'ce1', name: 'coupon_view', owner: '食尚玩家', purpose: '優惠券瀏覽漏斗', status: 'approved' },
  { id: 'ce2', name: 'health_tool_use', owner: '健康 2.0', purpose: 'BMI 工具使用追蹤', status: 'review' },
  { id: 'ce3', name: 'lucky_draw_enter', owner: '女人我最大', purpose: '抽獎活動參與追蹤', status: 'approved' },
];

// ── Events Tab ──────────────────────────────────────────────────────────────

export function EventsTab() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const categories: EventCategory[] = ['頁面瀏覽', '互動行為', '內容消費', '發送狀態', '渠道回應', 'App 生命週期'];

  const filtered = useMemo(
    () =>
      eventCatalog.filter((e) => {
        const byText = e.name.toLowerCase().includes(query.toLowerCase());
        const byCat = categoryFilter === 'all' || e.category === categoryFilter;
        return byText && byCat;
      }),
    [query, categoryFilter]
  );

  const toggleExpand = (name: string) => {
    setExpandedEvent((prev) => (prev === name ? null : name));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋事件名稱..."
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as EventCategory | 'all')}
          className="px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="all">全部分類</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="text-xs text-ph-secondary">共 {filtered.length} / {eventCatalog.length} 個事件</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-ph-surface">
              <TableHead className="w-[260px]">Event Name</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[80px]">觸發</TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[100px]">Volume (7d)</TableHead>
              <TableHead>Last Triggered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((event) => {
              const Icon = event.icon;
              const isExpanded = expandedEvent === event.name;
              return (
                <React.Fragment key={event.name}>
                  <TableRow
                    className={`cursor-pointer transition-colors ${isExpanded ? 'bg-ph-surface/70' : 'hover:bg-ph-surface/50'}`}
                    onClick={() => toggleExpand(event.name)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-ph-secondary flex-shrink-0" />
                        <span className="font-mono text-sm text-ph-text">{event.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[event.category]}`}>
                        {event.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${triggerModeColors[event.triggerMode]}`}>
                        {event.triggerMode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          event.status === 'Active'
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}>
                          {event.status}
                        </span>
                        {event.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-ph-secondary font-mono">{event.volume7d}</TableCell>
                    <TableCell className="text-sm text-ph-secondary">{event.lastTriggered}</TableCell>
                  </TableRow>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <TableRow className="bg-ph-surface/40">
                      <TableCell colSpan={6} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Description + trigger */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-ph-muted mb-1">說明</div>
                              <div className="text-sm text-ph-text">{event.description}</div>
                            </div>
                            <div>
                              <div className="text-xs text-ph-muted mb-1">觸發條件</div>
                              <div className="text-sm text-ph-text">{event.triggerCondition}</div>
                            </div>
                          </div>

                          {/* Parameters table */}
                          <div>
                            <div className="text-xs text-ph-muted mb-2">事件參數</div>
                            <div className="border border-border rounded-md overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-ph-muted">
                                    <th className="text-left px-3 py-2 font-medium">參數</th>
                                    <th className="text-left px-3 py-2 font-medium">型態</th>
                                    <th className="text-left px-3 py-2 font-medium w-16">必填</th>
                                    <th className="text-left px-3 py-2 font-medium">說明</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {event.params.map((p) => (
                                    <tr key={p.name} className="border-t border-border">
                                      <td className="px-3 py-1.5 font-mono text-xs">{p.name}</td>
                                      <td className="px-3 py-1.5">
                                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono">{p.type}</span>
                                      </td>
                                      <td className="px-3 py-1.5 text-center">{p.required ? '✅' : '⬜'}</td>
                                      <td className="px-3 py-1.5 text-xs text-ph-secondary">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Common required fields */}
                          <div>
                            <div className="text-xs text-ph-muted mb-1">共通必填欄位（所有事件）</div>
                            <div className="flex flex-wrap gap-1.5">
                              {commonRequiredFields.map((f) => (
                                <span key={f.name} className="px-2 py-0.5 text-xs bg-gray-50 border border-gray-200 rounded font-mono text-ph-secondary">
                                  {f.name} <span className="text-ph-muted">({f.type})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 text-xs text-ph-secondary">
        命名規範：snake_case、最多 60 字元、<code className="font-mono">system_</code> 為保留前綴。點擊事件列可展開查看完整參數定義。
      </div>
    </div>
  );
}

// ── SDK Tab ─────────────────────────────────────────────────────────────────

export function SdkTab() {
  return (
    <div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Web / App SDK 追蹤矩陣</span>
        </h3>
        <p className="text-sm text-ph-secondary mb-4">
          裝了 SDK 就有的：頁面瀏覽、捲動深度、影片播放、App 開啟/安裝、文章屬性。需要工程師配合的：點擊追蹤、站內搜尋、文章分享、所有自訂事件。
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-ph-surface">
                <TableHead>事件</TableHead>
                <TableHead className="w-[100px] text-center">Web SDK</TableHead>
                <TableHead className="w-[100px] text-center">App SDK</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sdkMatrix.map((row) => (
                <TableRow key={row.event}>
                  <TableCell className="font-mono text-sm text-ph-text">{row.event}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      row.web === '自動' ? 'bg-green-50 text-green-700 border-green-200' :
                      row.web === '手動' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>{row.web}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      row.app === '自動' ? 'bg-green-50 text-green-700 border-green-200' :
                      row.app === '手動' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>{row.app}</span>
                  </TableCell>
                  <TableCell className="text-sm text-ph-secondary">{row.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="border border-border rounded-lg p-3 bg-white">
          <ShieldCheck className="w-4 h-4 mb-1 text-green-600" />
          <span className="font-medium text-ph-text">不阻塞頁面</span>
          <div className="text-ph-secondary mt-0.5">SDK 非同步載入，靜默失敗</div>
        </div>
        <div className="border border-border rounded-lg p-3 bg-white">
          <Clock3 className="w-4 h-4 mb-1 text-ph-blue" />
          <span className="font-medium text-ph-text">入庫 &lt; 5 秒</span>
          <div className="text-ph-secondary mt-0.5">行為發生到可查詢</div>
        </div>
        <div className="border border-border rounded-lg p-3 bg-white">
          <Filter className="w-4 h-4 mb-1 text-purple-600" />
          <span className="font-medium text-ph-text">event_id 去重</span>
          <div className="text-ph-secondary mt-0.5">5 分鐘內同 ID 只寫入一次</div>
        </div>
      </div>
    </div>
  );
}

// ── Properties Tab ──────────────────────────────────────────────────────────

export function PropertiesTab() {
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      propertiesCatalog.filter((p) => {
        const byType = typeFilter === 'all' || p.propertyType === typeFilter;
        const byQuery =
          p.displayName.includes(query) ||
          p.code.toLowerCase().includes(query.toLowerCase());
        return byType && byQuery;
      }),
    [typeFilter, query]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋屬性名稱或代碼..."
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'all')}
          className="px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="all">全部類型</option>
          <option value="event">事件屬性</option>
          <option value="user">用戶屬性</option>
          <option value="content">內容屬性</option>
        </select>
        <span className="text-xs text-ph-secondary">共 {filtered.length} 個屬性</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-ph-surface">
              <TableHead>顯示名稱</TableHead>
              <TableHead>屬性代碼</TableHead>
              <TableHead>型態</TableHead>
              <TableHead>屬性類型</TableHead>
              <TableHead>來源</TableHead>
              <TableHead>Meta Tag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((prop) => (
              <TableRow key={prop.code}>
                <TableCell className="text-ph-text">{prop.displayName}</TableCell>
                <TableCell className="font-mono text-sm">{prop.code}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono">{prop.dataType}</span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${propertyTypeColors[prop.propertyType]}`}>
                    {propertyTypeLabel[prop.propertyType]}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-ph-secondary">{prop.source}</TableCell>
                <TableCell className="font-mono text-xs text-ph-muted">{prop.metaTag || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-ph-surface border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-ph-text mb-2">更新規則（PRD-003 §8.3）</h4>
          <ul className="text-xs text-ph-secondary space-y-1 list-disc list-inside">
            <li>同一屬性採 Last Write Wins</li>
            <li>陣列型支援「新增」與「覆蓋」兩種模式</li>
            <li>CSV 匯入必須含識別鍵（<code className="font-mono">cora_id</code> 或 <code className="font-mono">member_id</code>）</li>
            <li>未註冊屬性代碼不可匯入（防止野生欄位）</li>
          </ul>
        </div>
        <div className="bg-ph-surface border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-ph-text mb-2">匯入通道（PRD-003 §8.2）</h4>
          <ul className="text-xs text-ph-secondary space-y-1 list-disc list-inside">
            <li><strong>Phase 2a</strong>：CLI 工具 + API（PM 操作）</li>
            <li><strong>Phase 2b</strong>：Admin 後台上傳 + CDP API connector</li>
            <li><strong>不做</strong>：外部系統主動 push、自動排程同步</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Custom Events Tab ───────────────────────────────────────────────────────

function statusVariant(status: CustomEventRequest['status']): 'default' | 'secondary' | 'outline' {
  if (status === 'approved') return 'default';
  if (status === 'review') return 'secondary';
  return 'outline';
}

function statusLabel(status: CustomEventRequest['status']): string {
  if (status === 'approved') return '已核准';
  if (status === 'review') return '審核中';
  return '草稿';
}

export function CustomTab() {
  const [customRequests, setCustomRequests] = useState<CustomEventRequest[]>(initialCustomRequests);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomOwner, setNewCustomOwner] = useState('健康 2.0');
  const [newCustomPurpose, setNewCustomPurpose] = useState('');

  const addCustomEventRequest = () => {
    const name = newCustomName.trim();
    if (!name) {
      alert('請輸入事件名稱（snake_case）。');
      return;
    }
    if (!/^[a-z][a-z0-9_]{1,59}$/.test(name) || name.startsWith('system_') || name.startsWith('_')) {
      alert('事件名稱格式不符：需為 snake_case，且不可使用 system_ 或 _ 前綴。');
      return;
    }
    const req: CustomEventRequest = {
      id: `ce_${Date.now()}`,
      name,
      owner: newCustomOwner,
      purpose: newCustomPurpose.trim() || '待補用途',
      status: 'draft',
    };
    setCustomRequests((prev) => [req, ...prev]);
    setNewCustomName('');
    setNewCustomPurpose('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3 flex items-center gap-2">
          <Tags className="w-4 h-4" />
          <span>申請自訂事件</span>
        </h3>
        <div className="space-y-3">
          <Input
            value={newCustomName}
            onChange={(e) => setNewCustomName(e.target.value)}
            placeholder="事件名稱（snake_case）"
            className="font-mono"
          />
          <select
            value={newCustomOwner}
            onChange={(e) => setNewCustomOwner(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm bg-white"
          >
            <option>健康 2.0</option>
            <option>食尚玩家</option>
            <option>女人我最大</option>
          </select>
          <textarea
            value={newCustomPurpose}
            onChange={(e) => setNewCustomPurpose(e.target.value)}
            rows={3}
            placeholder="用途（要用在哪個分群/報表）"
            className="w-full px-3 py-2 border border-border rounded text-sm"
          />
          <Button onClick={addCustomEventRequest}>送出審核</Button>
        </div>
        <div className="mt-3 text-xs text-ph-secondary space-y-1">
          <div>命名：snake_case、不可 <code className="font-mono">system_</code> / <code className="font-mono">_</code> 前綴</div>
          <div>限制：不可與標準事件同義重複、每事件參數上限 20 個</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">審核佇列</h3>
        <div className="space-y-2">
          {customRequests.map((request) => (
            <div key={request.id} className="border border-border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm font-semibold text-ph-text">{request.name}</div>
                <Badge variant={statusVariant(request.status)}>{statusLabel(request.status)}</Badge>
              </div>
              <div className="text-xs text-ph-secondary mt-1">{request.owner} · {request.purpose}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-ph-secondary bg-ph-surface border border-border rounded p-3">
          <strong>審核標準：</strong>跟現有事件有重疊嗎？有明確的下游用途嗎？參數設計合理嗎？
        </div>
      </div>
    </div>
  );
}
