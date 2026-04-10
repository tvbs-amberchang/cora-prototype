import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Filter,
  Layers,
  Search,
  ShieldCheck,
  Tags } from
'lucide-react';

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
{ name: 'app_install', category: 'app', mode: 'auto', description: 'App 首次安裝開啟', required: ['app_version', 'os_version'] }];

const sdkMatrix = [
{ event: 'page_view', web: '自動', app: '自動', note: 'SDK 內建' },
{ event: 'scroll', web: '自動', app: '自動', note: 'SDK 內建' },
{ event: 'click', web: '手動', app: '手動', note: '需指定目標元素' },
{ event: 'search', web: '手動', app: '手動', note: '搜尋提交時呼叫' },
{ event: 'video_play/video_complete', web: '自動', app: '自動', note: '播放器整合' },
{ event: 'article_share', web: '手動', app: '手動', note: '分享按鈕埋點' },
{ event: 'notification_click', web: '-', app: '自動', note: '從通知進站' },
{ event: 'email_*', web: '-', app: '-', note: 'Delivery 系統產生' }];

const initialCustomRequests: CustomEventRequest[] = [
{ id: 'ce1', name: 'coupon_view', owner: '食尚玩家', purpose: '優惠券瀏覽漏斗', status: 'approved' },
{ id: 'ce2', name: 'health_tool_use', owner: '健康 2.0', purpose: 'BMI 工具使用追蹤', status: 'review' }];

const categoryLabel: Record<EventCategory, string> = {
  page: '頁面瀏覽',
  engagement: '互動行為',
  content: '內容消費',
  delivery: '發送狀態',
  channel: '渠道回應',
  app: 'App 生命週期'
};

const modeLabel: Record<EventMode, string> = { auto: '自動', manual: '手動', system: '系統' };

export default function DataCore() {
  const [tab, setTab] = useState<'events' | 'sdk' | 'content' | 'custom' | 'retention' | 'attributes'>('events');
  const [eventQuery, setEventQuery] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory | 'all'>('all');
  const [eventMode, setEventMode] = useState<EventMode | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventDef>(eventCatalog[0]);

  const [customRequests, setCustomRequests] = useState<CustomEventRequest[]>(initialCustomRequests);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomOwner, setNewCustomOwner] = useState('健康 2.0');
  const [newCustomPurpose, setNewCustomPurpose] = useState('');

  const [queryEvent, setQueryEvent] = useState('page_view');
  const [queryDays, setQueryDays] = useState(7);
  const [queryThreshold, setQueryThreshold] = useState(3);

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

  const queryResult = useMemo(() => {
    const base = 120000;
    const eventFactor = queryEvent === 'page_view' ? 1 : queryEvent === 'video_complete' ? 0.42 : 0.21;
    const dayFactor = Math.min(1.2, queryDays / 30 + 0.2);
    const thresholdFactor = Math.max(0.12, 1 / Math.max(1, queryThreshold));
    return Math.round(base * eventFactor * dayFactor * thresholdFactor);
  }, [queryDays, queryEvent, queryThreshold]);

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
      status: 'draft'
    };
    setCustomRequests((prev) => [req, ...prev]);
    setNewCustomName('');
    setNewCustomPurpose('');
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">數據追蹤</h1>
        <p className="text-slate-500">統一事件模型、SDK 追蹤、內容屬性擷取與下游即時查詢</p>
      </div>

      <div className="bg-white rounded-xl border border-wf-border p-3 mb-6 flex flex-wrap gap-2">
        <button onClick={() => setTab('events')} className={`px-3 py-2 rounded text-sm ${tab === 'events' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>事件目錄</button>
        <button onClick={() => setTab('sdk')} className={`px-3 py-2 rounded text-sm ${tab === 'sdk' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>SDK 追蹤能力</button>
        <button onClick={() => setTab('content')} className={`px-3 py-2 rounded text-sm ${tab === 'content' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>內容屬性擷取</button>
        <button onClick={() => setTab('custom')} className={`px-3 py-2 rounded text-sm ${tab === 'custom' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>自訂事件治理</button>
        <button onClick={() => setTab('attributes')} className={`px-3 py-2 rounded text-sm ${tab === 'attributes' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>用戶屬性字典</button>
        <button onClick={() => setTab('retention')} className={`px-3 py-2 rounded text-sm ${tab === 'retention' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>保留與查詢</button>
      </div>

      {tab === 'events' &&
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2"><Activity className="w-4 h-4" /><span>標準事件目錄（16）</span></h3>
              <div className="text-xs text-slate-500">含 `event_id` 去重 + 非同步送出</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={eventQuery} onChange={(e) => setEventQuery(e.target.value)} placeholder="搜尋事件名稱..." className="w-full pl-9 pr-3 py-2 border border-wf-border rounded text-sm" />
              </div>
              <div className="flex items-center space-x-2">
                <select value={eventCategory} onChange={(e) => setEventCategory(e.target.value as EventCategory | 'all')} className="w-full px-3 py-2 border border-wf-border rounded text-sm bg-white">
                  <option value="all">全部分類</option>
                  {Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={eventMode} onChange={(e) => setEventMode(e.target.value as EventMode | 'all')} className="w-full px-3 py-2 border border-wf-border rounded text-sm bg-white">
                  <option value="all">全部模式</option>
                  <option value="auto">自動</option>
                  <option value="manual">手動</option>
                  <option value="system">系統</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredEvents.map((event) =>
            <button key={event.name} onClick={() => setSelectedEvent(event)} className={`w-full text-left border rounded p-3 ${selectedEvent.name === event.name ? 'border-blue-400 bg-brand-50' : 'border-wf-border hover:border-slate-400'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-semibold text-slate-900">{event.name}</div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{categoryLabel[event.category]}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{modeLabel[event.mode]}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{event.description}</div>
                </button>
            )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><FileSearch className="w-4 h-4" /><span>事件定義詳情</span></h3>
            <div className="border border-wf-border rounded p-4 bg-slate-50 space-y-3">
              <div>
                <div className="text-xs text-slate-500">事件名稱</div>
                <div className="font-mono text-sm font-semibold text-slate-900">{selectedEvent.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">說明</div>
                <div className="text-sm text-slate-700">{selectedEvent.description}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">必填欄位</div>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.required.map((field) => <span key={field} className="px-2 py-1 text-xs bg-white border border-wf-border rounded font-mono">{field}</span>)}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 space-y-1">
              <div>共通必填：`cora_id`、`session_id`、`platform`、`brand`、`created_at`、`event_id`</div>
              <div>命名規範：snake_case、最多 60 字元、`system_` 保留前綴</div>
            </div>
          </div>
        </div>
      }

      {tab === 'sdk' &&
      <div className="bg-white rounded-xl border border-wf-border p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2"><Database className="w-4 h-4" /><span>Web/App SDK 追蹤矩陣</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-wf-border">
                <tr>
                  <th className="py-2">事件</th><th className="py-2">Web</th><th className="py-2">App</th><th className="py-2">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sdkMatrix.map((row) =>
              <tr key={row.event}>
                    <td className="py-3 font-mono text-slate-900">{row.event}</td>
                    <td className="py-3">{row.web}</td>
                    <td className="py-3">{row.app}</td>
                    <td className="py-3 text-slate-500">{row.note}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="border border-wf-border rounded p-3 bg-slate-50"><ShieldCheck className="w-4 h-4 mb-1 text-green-600" />SDK 非同步送出，頁面靜默失敗</div>
            <div className="border border-wf-border rounded p-3 bg-slate-50"><Clock3 className="w-4 h-4 mb-1 text-brand-500" />事件入庫延遲目標 &lt; 5 秒</div>
            <div className="border border-wf-border rounded p-3 bg-slate-50"><Filter className="w-4 h-4 mb-1 text-purple-600" />5 分鐘內以 `event_id` 去重</div>
          </div>
        </div>
      }

      {tab === 'content' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Meta Tag 擷取映射</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-wf-border">
                  <tr><th className="py-2">CORA 欄位</th><th className="py-2">Meta Tag</th><th className="py-2">用途</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2 font-mono">content_category</td><td className="py-2 font-mono">article:section</td><td className="py-2 text-slate-600">文章分類分群</td></tr>
                  <tr><td className="py-2 font-mono">content_tags[]</td><td className="py-2 font-mono">article:tag</td><td className="py-2 text-slate-600">細粒度標籤</td></tr>
                  <tr><td className="py-2 font-mono">content_author</td><td className="py-2 font-mono">article:author</td><td className="py-2 text-slate-600">作者分析</td></tr>
                  <tr><td className="py-2 font-mono">content_published_at</td><td className="py-2 font-mono">article:published_time</td><td className="py-2 text-slate-600">時間切片</td></tr>
                  <tr><td className="py-2 font-mono">content_title</td><td className="py-2 font-mono">og:title</td><td className="py-2 text-slate-600">內容識別</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">各站盤點狀態（NEED-REVIEW）</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between border border-wf-border rounded p-3"><span>健康 2.0 `article:tag` 輸出一致</span><input type="checkbox" defaultChecked /></label>
              <label className="flex items-center justify-between border border-wf-border rounded p-3"><span>食尚玩家 `article:tag` 格式為陣列</span><input type="checkbox" /></label>
              <label className="flex items-center justify-between border border-wf-border rounded p-3"><span>女人我最大 `article:tag` 可用</span><input type="checkbox" defaultChecked /></label>
            </div>
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">若某站缺少 `article:tag`，仍可先用 `content_category` 做分群，標籤層級分群將降級。</p>
          </div>
        </div>
      }

      {tab === 'custom' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Tags className="w-4 h-4" /><span>申請自訂事件</span></h3>
            <div className="space-y-3">
              <input value={newCustomName} onChange={(e) => setNewCustomName(e.target.value)} placeholder="事件名稱（snake_case）" className="w-full px-3 py-2 border border-wf-border rounded text-sm font-mono" />
              <select value={newCustomOwner} onChange={(e) => setNewCustomOwner(e.target.value)} className="w-full px-3 py-2 border border-wf-border rounded text-sm bg-white">
                <option>健康 2.0</option><option>食尚玩家</option><option>女人我最大</option>
              </select>
              <textarea value={newCustomPurpose} onChange={(e) => setNewCustomPurpose(e.target.value)} rows={3} placeholder="用途（要用在哪個分群/報表）" className="w-full px-3 py-2 border border-wf-border rounded text-sm" />
              <button onClick={addCustomEventRequest} className="px-3 py-2 bg-wf-black text-white rounded text-sm hover:translate-x-1.5 transition-all">送出審核</button>
            </div>
            <div className="mt-3 text-xs text-slate-500">規則：不可 `system_` / `_` 前綴、不可與標準事件同義重複、每事件參數上限 20。</div>
          </div>
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">審核佇列</h3>
            <div className="space-y-2">
              {customRequests.map((request) =>
            <div key={request.id} className="border border-wf-border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-semibold text-slate-900">{request.name}</div>
                    <span className={`px-2 py-0.5 text-xs rounded ${request.status === 'approved' ? 'bg-green-100 text-green-700' : request.status === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {request.status === 'approved' ? '已核准' : request.status === 'review' ? '審核中' : '草稿'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{request.owner} · {request.purpose}</div>
                </div>
            )}
            </div>
          </div>
        </div>
      }

      {tab === 'attributes' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">屬性字典</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-wf-border">
                  <tr><th className="py-2">顯示名稱</th><th className="py-2">代碼</th><th className="py-2">型態</th><th className="py-2">來源</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2">性別</td><td className="py-2 font-mono">gender</td><td className="py-2">string</td><td className="py-2">cdp_sync</td></tr>
                  <tr><td className="py-2">興趣偏好</td><td className="py-2 font-mono">interest</td><td className="py-2">array</td><td className="py-2">system</td></tr>
                  <tr><td className="py-2">會員等級</td><td className="py-2 font-mono">membership_level</td><td className="py-2">string</td><td className="py-2">csv_upload</td></tr>
                  <tr><td className="py-2">城市</td><td className="py-2 font-mono">city</td><td className="py-2">string</td><td className="py-2">cdp_sync</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">更新規則</h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>同一屬性採 Last Write Wins</li>
              <li>陣列型支援「新增」與「覆蓋」兩種模式</li>
              <li>CSV 匯入必須含識別鍵（`cora_id` 或 `member_id`）</li>
              <li>未註冊屬性代碼不可匯入（防止野生欄位）</li>
            </ul>
          </div>
        </div>
      }

      {tab === 'retention' &&
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2"><Layers className="w-4 h-4" /><span>資料保留分層</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="border border-green-200 bg-green-50 rounded p-3"><div className="font-semibold text-green-800">熱資料</div><div className="text-green-700 text-xs mt-1">近 90 天 · 秒級查詢</div></div>
              <div className="border border-brand-200 bg-brand-50 rounded p-3"><div className="font-semibold text-blue-800">溫資料</div><div className="text-brand-700 text-xs mt-1">91 天~1 年 · 數秒級</div></div>
              <div className="border border-wf-border bg-slate-50 rounded p-3"><div className="font-semibold text-slate-700">冷資料</div><div className="text-slate-600 text-xs mt-1">1 年以上 · 排程查詢</div></div>
            </div>
            <div className="mt-4 text-xs text-slate-500">預估規模：月 `page_view` 約 1.27 億；尖峰約 500 events/sec（含 scroll）。</div>
          </div>

          <div className="bg-white rounded-xl border border-wf-border p-5">
            <h3 className="font-semibold text-slate-900 mb-3">分群查詢模擬器</h3>
            <div className="space-y-3">
              <select value={queryEvent} onChange={(e) => setQueryEvent(e.target.value)} className="w-full px-3 py-2 border border-wf-border rounded text-sm bg-white">
                <option value="page_view">page_view</option>
                <option value="video_complete">video_complete</option>
                <option value="notification_click">notification_click</option>
              </select>
              <label className="text-xs text-slate-600 block">時間範圍（天）</label>
              <input type="range" min={1} max={90} value={queryDays} onChange={(e) => setQueryDays(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-500">近 {queryDays} 天</div>
              <label className="text-xs text-slate-600 block">事件次數門檻（&gt;=）</label>
              <input type="number" min={1} value={queryThreshold} onChange={(e) => setQueryThreshold(Number(e.target.value) || 1)} className="w-full px-3 py-2 border border-wf-border rounded text-sm" />
              <div className="border border-wf-border rounded p-3 bg-slate-50">
                <div className="text-xs text-slate-500">預估符合人數</div>
                <div className="text-2xl font-mono font-bold text-slate-900">{queryResult.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      }

      <div className="mt-6 text-xs text-slate-500 bg-slate-50 border border-wf-border rounded p-4">
        Data Core 與下游對接：Segmentation（PRD-004）讀事件條件、Delivery（PRD-005）寫入 `message_*`、People View（PRD-006）顯示個體事件時間線。
      </div>
    </div>);
}
