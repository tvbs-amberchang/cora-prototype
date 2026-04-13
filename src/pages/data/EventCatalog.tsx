// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Event catalog table, SDK tracking matrix, content attributes, custom events, and user attributes tabs for DataCore

import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Database, FileSearch, Filter, Clock3, ShieldCheck, Tags } from 'lucide-react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type EventMode = 'auto' | 'manual' | 'system';
type EventCategory = 'page' | 'engagement' | 'content' | 'delivery' | 'channel' | 'app';

interface EventDef {
  name: string;
  category: EventCategory;
  mode: EventMode;
  description: string;
  required: string[];
}

interface CustomEventRequest {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  status: 'draft' | 'review' | 'approved';
}

const eventCatalog: EventDef[] = [
  { name: 'page_view', category: 'page', mode: 'auto', description: '頁面載入事件（含內容屬性）', required: ['page_url', 'page_title'] },
  { name: 'click', category: 'engagement', mode: 'manual', description: '關鍵 CTA 點擊追蹤', required: ['click_target'] },
  { name: 'scroll', category: 'engagement', mode: 'auto', description: '25/50/75/100 深度里程碑', required: ['scroll_depth', 'page_url'] },
  { name: 'search', category: 'engagement', mode: 'manual', description: '站內搜尋送出', required: ['search_query'] },
  { name: 'video_play', category: 'content', mode: 'auto', description: '影音開始播放', required: ['video_id', 'video_title'] },
  { name: 'video_complete', category: 'content', mode: 'auto', description: '播放達 95%', required: ['video_id', 'video_title'] },
  { name: 'article_share', category: 'content', mode: 'manual', description: '文章分享', required: ['share_channel', 'page_url'] },
  { name: 'message_sent', category: 'delivery', mode: 'system', description: '遞送系統成功送出', required: ['channel', 'task_id', 'template_id'] },
  { name: 'message_delivered', category: 'delivery', mode: 'system', description: '服務商回報送達', required: ['channel', 'task_id'] },
  { name: 'message_failed', category: 'delivery', mode: 'system', description: '遞送失敗', required: ['channel', 'task_id', 'error_code'] },
  { name: 'notification_click', category: 'channel', mode: 'system', description: '用戶點擊通知', required: ['channel', 'campaign_id', 'message_id'] },
  { name: 'email_open', category: 'channel', mode: 'system', description: 'Email 追蹤像素載入（僅趨勢）', required: ['campaign_id', 'message_id'] },
  { name: 'email_click', category: 'channel', mode: 'system', description: 'Email 連結點擊', required: ['campaign_id', 'message_id', 'click_url'] },
  { name: 'email_unsubscribe', category: 'channel', mode: 'system', description: 'Email 退訂', required: ['campaign_id', 'message_id'] },
  { name: 'app_open', category: 'app', mode: 'auto', description: 'App 冷啟動/回前景', required: ['open_source', 'app_version'] },
  { name: 'app_install', category: 'app', mode: 'auto', description: 'App 首次安裝開啟', required: ['app_version', 'os_version'] },
];

const sdkMatrix = [
  { event: 'page_view', web: '自動', app: '自動', note: 'SDK 內建' },
  { event: 'scroll', web: '自動', app: '自動', note: 'SDK 內建' },
  { event: 'click', web: '手動', app: '手動', note: '需指定目標元素' },
  { event: 'search', web: '手動', app: '手動', note: '搜尋提交時呼叫' },
  { event: 'video_play/video_complete', web: '自動', app: '自動', note: '播放器整合' },
  { event: 'article_share', web: '手動', app: '手動', note: '分享按鈕埋點' },
  { event: 'notification_click', web: '-', app: '自動', note: '從通知進站' },
  { event: 'email_*', web: '-', app: '-', note: 'Delivery 系統產生' },
];

const initialCustomRequests: CustomEventRequest[] = [
  { id: 'ce1', name: 'coupon_view', owner: '食尚玩家', purpose: '優惠券瀏覽漏斗', status: 'approved' },
  { id: 'ce2', name: 'health_tool_use', owner: '健康 2.0', purpose: 'BMI 工具使用追蹤', status: 'review' },
];

const categoryLabel: Record<EventCategory, string> = {
  page: '頁面瀏覽',
  engagement: '互動行為',
  content: '內容消費',
  delivery: '發送狀態',
  channel: '渠道回應',
  app: 'App 生命週期',
};

const modeLabel: Record<EventMode, string> = { auto: '自動', manual: '手動', system: '系統' };

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

// ── Events Tab ──────────────────────────────────────────────────────────────

export function EventsTab() {
  const [eventQuery, setEventQuery] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory | 'all'>('all');
  const [eventMode, setEventMode] = useState<EventMode | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventDef>(eventCatalog[0]);

  const filteredEvents = useMemo(
    () =>
      eventCatalog.filter((event) => {
        const byText = event.name.toLowerCase().includes(eventQuery.toLowerCase());
        const byCategory = eventCategory === 'all' || event.category === eventCategory;
        const byMode = eventMode === 'all' || event.mode === eventMode;
        return byText && byCategory && byMode;
      }),
    [eventCategory, eventMode, eventQuery]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ph-text flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>標準事件目錄（16）</span>
          </h3>
          <div className="text-xs text-ph-secondary">含 `event_id` 去重 + 非同步送出</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
              placeholder="搜尋事件名稱..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value as EventCategory | 'all')}
              className="w-full px-3 py-2 border border-border rounded text-sm bg-white"
            >
              <option value="all">全部分類</option>
              {Object.entries(categoryLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={eventMode}
              onChange={(e) => setEventMode(e.target.value as EventMode | 'all')}
              className="w-full px-3 py-2 border border-border rounded text-sm bg-white"
            >
              <option value="all">全部模式</option>
              <option value="auto">自動</option>
              <option value="manual">手動</option>
              <option value="system">系統</option>
            </select>
          </div>
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredEvents.map((event) => (
            <button
              key={event.name}
              onClick={() => setSelectedEvent(event)}
              className={`w-full text-left border rounded p-3 transition-colors ${
                selectedEvent.name === event.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-ph-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm font-semibold text-ph-text">{event.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{categoryLabel[event.category]}</Badge>
                  <Badge variant="outline">{modeLabel[event.mode]}</Badge>
                </div>
              </div>
              <div className="text-xs text-ph-secondary mt-1">{event.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3 flex items-center gap-2">
          <FileSearch className="w-4 h-4" />
          <span>事件定義詳情</span>
        </h3>
        <div className="border border-border rounded p-4 bg-ph-surface space-y-3">
          <div>
            <div className="text-xs text-ph-secondary">事件名稱</div>
            <div className="font-mono text-sm font-semibold text-ph-text">{selectedEvent.name}</div>
          </div>
          <div>
            <div className="text-xs text-ph-secondary">說明</div>
            <div className="text-sm text-ph-text">{selectedEvent.description}</div>
          </div>
          <div>
            <div className="text-xs text-ph-secondary mb-1">必填欄位</div>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.required.map((field) => (
                <span key={field} className="px-2 py-1 text-xs bg-white border border-border rounded font-mono">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-ph-secondary space-y-1">
          <div>共通必填：`cora_id`、`session_id`、`platform`、`brand`、`created_at`、`event_id`</div>
          <div>命名規範：snake_case、最多 60 字元、`system_` 保留前綴</div>
        </div>
      </div>
    </div>
  );
}

// ── SDK Tab ──────────────────────────────────────────────────────────────────

export function SdkTab() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
        <Database className="w-4 h-4" />
        <span>Web/App SDK 追蹤矩陣</span>
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>事件</TableHead>
              <TableHead>Web</TableHead>
              <TableHead>App</TableHead>
              <TableHead>備註</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sdkMatrix.map((row) => (
              <TableRow key={row.event}>
                <TableCell className="font-mono text-ph-text">{row.event}</TableCell>
                <TableCell>{row.web}</TableCell>
                <TableCell>{row.app}</TableCell>
                <TableCell className="text-ph-secondary">{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="border border-border rounded p-3 bg-ph-surface">
          <ShieldCheck className="w-4 h-4 mb-1 text-green-600" />
          SDK 非同步送出，頁面靜默失敗
        </div>
        <div className="border border-border rounded p-3 bg-ph-surface">
          <Clock3 className="w-4 h-4 mb-1 text-ph-blue" />
          事件入庫延遲目標 &lt; 5 秒
        </div>
        <div className="border border-border rounded p-3 bg-ph-surface">
          <Filter className="w-4 h-4 mb-1 text-purple-600" />
          5 分鐘內以 `event_id` 去重
        </div>
      </div>
    </div>
  );
}

// ── Content Tab ──────────────────────────────────────────────────────────────

export function ContentTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">Meta Tag 擷取映射</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CORA 欄位</TableHead>
                <TableHead>Meta Tag</TableHead>
                <TableHead>用途</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">content_category</TableCell>
                <TableCell className="font-mono">article:section</TableCell>
                <TableCell className="text-ph-secondary">文章分類分群</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">content_tags[]</TableCell>
                <TableCell className="font-mono">article:tag</TableCell>
                <TableCell className="text-ph-secondary">細粒度標籤</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">content_author</TableCell>
                <TableCell className="font-mono">article:author</TableCell>
                <TableCell className="text-ph-secondary">作者分析</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">content_published_at</TableCell>
                <TableCell className="font-mono">article:published_time</TableCell>
                <TableCell className="text-ph-secondary">時間切片</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">content_title</TableCell>
                <TableCell className="font-mono">og:title</TableCell>
                <TableCell className="text-ph-secondary">內容識別</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">各站盤點狀態（NEED-REVIEW）</h3>
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between border border-border rounded p-3">
            <span>健康 2.0 `article:tag` 輸出一致</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="flex items-center justify-between border border-border rounded p-3">
            <span>食尚玩家 `article:tag` 格式為陣列</span>
            <input type="checkbox" />
          </label>
          <label className="flex items-center justify-between border border-border rounded p-3">
            <span>女人我最大 `article:tag` 可用</span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          若某站缺少 `article:tag`，仍可先用 `content_category` 做分群，標籤層級分群將降級。
        </p>
      </div>
    </div>
  );
}

// ── Custom Events Tab ────────────────────────────────────────────────────────

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
        <div className="mt-3 text-xs text-ph-secondary">
          規則：不可 `system_` / `_` 前綴、不可與標準事件同義重複、每事件參數上限 20。
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
      </div>
    </div>
  );
}

// ── Attributes Tab ────────────────────────────────────────────────────────────

export function AttributesTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">屬性字典</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>顯示名稱</TableHead>
                <TableHead>代碼</TableHead>
                <TableHead>型態</TableHead>
                <TableHead>來源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>性別</TableCell>
                <TableCell className="font-mono">gender</TableCell>
                <TableCell>string</TableCell>
                <TableCell>cdp_sync</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>興趣偏好</TableCell>
                <TableCell className="font-mono">interest</TableCell>
                <TableCell>array</TableCell>
                <TableCell>system</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>會員等級</TableCell>
                <TableCell className="font-mono">membership_level</TableCell>
                <TableCell>string</TableCell>
                <TableCell>csv_upload</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>城市</TableCell>
                <TableCell className="font-mono">city</TableCell>
                <TableCell>string</TableCell>
                <TableCell>cdp_sync</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-3">更新規則</h3>
        <ul className="text-sm text-ph-text space-y-2">
          <li>同一屬性採 Last Write Wins</li>
          <li>陣列型支援「新增」與「覆蓋」兩種模式</li>
          <li>CSV 匯入必須含識別鍵（`cora_id` 或 `member_id`）</li>
          <li>未註冊屬性代碼不可匯入（防止野生欄位）</li>
        </ul>
      </div>
    </div>
  );
}
