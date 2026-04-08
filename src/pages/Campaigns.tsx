import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  Gift,
  LayoutTemplate,
  MessageSquareText,
  Monitor,
  Plus,
  Search,
  Smartphone,
  Target } from
'lucide-react';

type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'ended';
type CampaignContentType = 'card' | 'survey' | 'lottery' | 'checkin';
type ModuleType = 'inline' | 'popup';
type LotteryMode = 'register' | 'instant';
type Brand = 'health' | 'supertaste' | 'woman';
type PopupPosition = 'bottom' | 'right-bottom' | 'left-bottom';
type TemplateTheme = 'default' | 'health' | 'warm';

interface FrequencyControl {
  hideAfterComplete: boolean;
  perDayLimit: number;
  globalDailyLimit: number;
  cooldownHours: number;
  lifetimeLimit: number;
}

interface Prize {
  id: string;
  name: string;
  stock: number;
  remaining: number;
  weight: number;
}

interface CampaignMetrics {
  impressions: number;
  interactions: number;
  completions: number;
  surveyAnswerRate?: number;
  lotteryWinners?: number;
  checkinGoalReached?: number;
}

interface Campaign {
  id: string;
  name: string;
  brand: Brand;
  contentType: CampaignContentType;
  moduleType: ModuleType;
  status: CampaignStatus;
  startAt: string;
  endAt: string;
  ga4Sync: boolean;
  triggers: string[];
  frequency: FrequencyControl;
  metrics: CampaignMetrics;
  lotteryMode?: LotteryMode;
  prizes?: Prize[];
  checkinCycleDays?: number;
  checkinRewardLinkedLotteryId?: string;
  popupPosition: PopupPosition;
  templateTheme: TemplateTheme;
  headline: string;
  subheadline: string;
  ctaText: string;
  surveyOptions?: string[];
}

const statusMap: Record<CampaignStatus, {label: string;color: string;}> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
  scheduled: { label: '排程中', color: 'bg-brand-100 text-brand-700' },
  active: { label: '進行中', color: 'bg-green-100 text-green-700' },
  ended: { label: '已結束', color: 'bg-slate-200 text-slate-600' }
};

const brandMap: Record<Brand, string> = {
  health: '健康 2.0',
  supertaste: '食尚玩家',
  woman: '女人我最大'
};

const defaultCampaigns: Campaign[] = [
{
  id: 'c1',
  name: '健康主題偏好問卷',
  brand: 'health',
  contentType: 'survey',
  moduleType: 'popup',
  status: 'active',
  startAt: '2026-04-01T00:00',
  endAt: '2026-04-30T23:59',
  ga4Sync: false,
  triggers: ['brand=health', '頁面停留 > 30 秒', 'segment: 糖尿病活躍讀者'],
  frequency: {
    hideAfterComplete: true,
    perDayLimit: 2,
    globalDailyLimit: 5,
    cooldownHours: 24,
    lifetimeLimit: 3
  },
  metrics: {
    impressions: 45200,
    interactions: 22800,
    completions: 12500,
    surveyAnswerRate: 54.8
  },
  popupPosition: 'bottom',
  templateTheme: 'health',
  headline: '你對哪些健康主題有興趣？',
  subheadline: '完成後可獲得更精準內容推薦',
  ctaText: '送出',
  surveyOptions: ['減重瘦身', '糖尿病照護', '心血管保健']
},
{
  id: 'c2',
  name: '女大母親節抽獎',
  brand: 'woman',
  contentType: 'lottery',
  moduleType: 'inline',
  status: 'active',
  startAt: '2026-04-05T00:00',
  endAt: '2026-05-10T23:59',
  ga4Sync: true,
  triggers: ['brand=woman', 'content_category=beauty'],
  frequency: {
    hideAfterComplete: false,
    perDayLimit: 1,
    globalDailyLimit: 5,
    cooldownHours: 24,
    lifetimeLimit: 5
  },
  metrics: {
    impressions: 89000,
    interactions: 45000,
    completions: 45000,
    lotteryWinners: 320
  },
  lotteryMode: 'register',
  prizes: [
  {
    id: 'p1',
    name: '保養組 A',
    stock: 200,
    remaining: 17,
    weight: 40
  },
  {
    id: 'p2',
    name: '保養組 B',
    stock: 150,
    remaining: 0,
    weight: 35
  },
  {
    id: 'p3',
    name: '小樣組',
    stock: 500,
    remaining: 112,
    weight: 25
  }],
  popupPosition: 'bottom',
  templateTheme: 'warm',
  headline: '母親節感恩抽獎',
  subheadline: '專櫃保養品限量中',
  ctaText: '立即參加'
},
{
  id: 'c3',
  name: '食尚 7 天簽到任務',
  brand: 'supertaste',
  contentType: 'checkin',
  moduleType: 'popup',
  status: 'scheduled',
  startAt: '2026-05-01T00:00',
  endAt: '2026-05-31T23:59',
  ga4Sync: false,
  triggers: ['brand=supertaste', '當日首次進站'],
  frequency: {
    hideAfterComplete: false,
    perDayLimit: 1,
    globalDailyLimit: 5,
    cooldownHours: 12,
    lifetimeLimit: 30
  },
  metrics: {
    impressions: 0,
    interactions: 0,
    completions: 0,
    checkinGoalReached: 0
  },
  checkinCycleDays: 7,
  checkinRewardLinkedLotteryId: 'c2',
  popupPosition: 'right-bottom',
  templateTheme: 'default',
  headline: '連續簽到任務',
  subheadline: '連續 7 天可獲抽獎資格',
  ctaText: '今日簽到'
}];

const typeLabel = (type: CampaignContentType) =>
type === 'card' ? '行銷卡片' :
type === 'survey' ? '問卷' :
type === 'lottery' ? '抽獎' :
'簽到';

const TypeIcon = ({ type }: {type: CampaignContentType;}) =>
type === 'card' ? <LayoutTemplate className="w-4 h-4 text-brand-500" /> :
type === 'survey' ? <MessageSquareText className="w-4 h-4 text-purple-600" /> :
type === 'lottery' ? <Gift className="w-4 h-4 text-red-600" /> :
<CalendarCheck className="w-4 h-4 text-orange-600" />;

const StatusBadge = ({ status }: {status: CampaignStatus;}) =>
<span className={`px-2 py-1 text-xs rounded ${statusMap[status].color}`}>
    {statusMap[status].label}
  </span>;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [inspectCampaign, setInspectCampaign] = useState<Campaign | null>(null);
  const [configPreviewCampaign, setConfigPreviewCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<Brand | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignContentType | 'all'>('all');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const [name, setName] = useState('新活動');
  const [brand, setBrand] = useState<Brand>('health');
  const [contentType, setContentType] = useState<CampaignContentType>('survey');
  const [moduleType, setModuleType] = useState<ModuleType>('popup');
  const [startAt, setStartAt] = useState('2026-04-10T09:00');
  const [endAt, setEndAt] = useState('2026-04-30T23:00');
  const [ga4Sync, setGa4Sync] = useState(false);
  const [triggers, setTriggers] = useState(['brand=health']);
  const [frequency, setFrequency] = useState<FrequencyControl>({
    hideAfterComplete: true,
    perDayLimit: 2,
    globalDailyLimit: 5,
    cooldownHours: 24,
    lifetimeLimit: 3
  });
  const [lotteryMode, setLotteryMode] = useState<LotteryMode>('instant');
  const [prizes, setPrizes] = useState<Prize[]>([
  {
    id: crypto.randomUUID(),
    name: '大獎',
    stock: 100,
    remaining: 100,
    weight: 50
  },
  {
    id: crypto.randomUUID(),
    name: '參加獎',
    stock: 500,
    remaining: 500,
    weight: 50
  }]);
  const [checkinCycleDays, setCheckinCycleDays] = useState(7);
  const [checkinRewardLotteryId, setCheckinRewardLotteryId] = useState<string>('');
  const [popupPosition, setPopupPosition] = useState<PopupPosition>('bottom');
  const [templateTheme, setTemplateTheme] = useState<TemplateTheme>('default');
  const [headline, setHeadline] = useState('活動標題');
  const [subheadline, setSubheadline] = useState('活動副標');
  const [ctaText, setCtaText] = useState('立即參加');
  const [surveyOptions, setSurveyOptions] = useState('選項 A, 選項 B');

  const resetEditor = () => {
    setEditing(null);
    setName('新活動');
    setBrand('health');
    setContentType('survey');
    setModuleType('popup');
    setStartAt('2026-04-10T09:00');
    setEndAt('2026-04-30T23:00');
    setGa4Sync(false);
    setTriggers(['brand=health']);
    setFrequency({
      hideAfterComplete: true,
      perDayLimit: 2,
      globalDailyLimit: 5,
      cooldownHours: 24,
      lifetimeLimit: 3
    });
    setLotteryMode('instant');
    setPrizes([
    {
      id: crypto.randomUUID(),
      name: '大獎',
      stock: 100,
      remaining: 100,
      weight: 50
    }]);
    setCheckinCycleDays(7);
    setCheckinRewardLotteryId('');
    setPopupPosition('bottom');
    setTemplateTheme('default');
    setHeadline('活動標題');
    setSubheadline('活動副標');
    setCtaText('立即參加');
    setSurveyOptions('選項 A, 選項 B');
  };

  const startEdit = (campaign: Campaign | null) => {
    if (!campaign) {
      resetEditor();
      setView('edit');
      return;
    }
    setEditing(campaign);
    setName(campaign.name);
    setBrand(campaign.brand);
    setContentType(campaign.contentType);
    setModuleType(campaign.moduleType);
    setStartAt(campaign.startAt);
    setEndAt(campaign.endAt);
    setGa4Sync(campaign.ga4Sync);
    setTriggers(campaign.triggers);
    setFrequency(campaign.frequency);
    setLotteryMode(campaign.lotteryMode ?? 'instant');
    setPrizes(campaign.prizes ?? []);
    setCheckinCycleDays(campaign.checkinCycleDays ?? 7);
    setCheckinRewardLotteryId(campaign.checkinRewardLinkedLotteryId ?? '');
    setPopupPosition(campaign.popupPosition);
    setTemplateTheme(campaign.templateTheme);
    setHeadline(campaign.headline);
    setSubheadline(campaign.subheadline);
    setCtaText(campaign.ctaText);
    setSurveyOptions((campaign.surveyOptions ?? []).join(', '));
    setView('edit');
  };

  const saveCampaign = (status: CampaignStatus) => {
    const payload: Campaign = {
      id: editing?.id ?? crypto.randomUUID(),
      name,
      brand,
      contentType,
      moduleType,
      status,
      startAt,
      endAt,
      ga4Sync,
      triggers: triggers.filter(Boolean),
      frequency,
      metrics: editing?.metrics ?? {
        impressions: 0,
        interactions: 0,
        completions: 0
      },
      lotteryMode: contentType === 'lottery' ? lotteryMode : undefined,
      prizes: contentType === 'lottery' ? prizes : undefined,
      checkinCycleDays: contentType === 'checkin' ? checkinCycleDays : undefined,
      checkinRewardLinkedLotteryId: contentType === 'checkin' && checkinRewardLotteryId ? checkinRewardLotteryId : undefined,
      popupPosition,
      templateTheme,
      headline,
      subheadline,
      ctaText,
      surveyOptions: contentType === 'survey' ? surveyOptions.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    };
    setCampaigns((prev) => {
      if (editing) return prev.map((c) => c.id === editing.id ? payload : c);
      return [payload, ...prev];
    });
    setView('list');
    resetEditor();
  };

  const filteredCampaigns = useMemo(() => campaigns.filter((campaign) => {
    const bySearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const byStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const byBrand = brandFilter === 'all' || campaign.brand === brandFilter;
    const byType = typeFilter === 'all' || campaign.contentType === typeFilter;
    return bySearch && byStatus && byBrand && byType;
  }), [brandFilter, campaigns, searchQuery, statusFilter, typeFilter]);

  const themeClass =
  templateTheme === 'health' ? 'bg-emerald-50 border-emerald-200' :
  templateTheme === 'warm' ? 'bg-amber-50 border-amber-200' :
  'bg-slate-50 border-slate-200';

  const popupPositionClass =
  popupPosition === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-4 w-[88%]' :
  popupPosition === 'right-bottom' ? 'right-4 bottom-4 w-[70%]' :
  'left-4 bottom-4 w-[70%]';

  const renderModuleCard = (compact = false) =>
  <div className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} ${themeClass}`}>
      <div className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>{headline}</div>
      <div className={`text-slate-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>{subheadline}</div>
      {contentType === 'survey' &&
    <div className="mt-2 space-y-1">
          {surveyOptions.
      split(',').
      map((opt) => opt.trim()).
      filter(Boolean).
      slice(0, compact ? 2 : 3).
      map((opt) =>
      <div key={opt} className={`px-2 py-1 bg-white border border-slate-200 rounded ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {opt}
            </div>
      )}
        </div>
    }
      {contentType === 'lottery' &&
    <div className={`${compact ? 'text-[11px]' : 'text-xs'} mt-2 text-slate-600`}>
          {lotteryMode === 'register' ? '登記制' : '即時制'} · 獎項 {prizes.length} 個
        </div>
    }
      {contentType === 'checkin' &&
    <div className={`${compact ? 'text-[11px]' : 'text-xs'} mt-2 text-slate-600`}>
          連續 {checkinCycleDays} 天
        </div>
    }
      <button className={`mt-2 px-3 py-1.5 bg-slate-900 text-white rounded ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {ctaText}
      </button>
    </div>;

  if (view === 'edit') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8 bg-slate-50">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => setView('list')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900">
              {editing ? '編輯行銷活動' : '建立行銷活動'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => saveCampaign('draft')} className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700">
              儲存草稿
            </button>
            <button onClick={() => saveCampaign('scheduled')} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">
              發佈並排程
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[470px] bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-7">
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">基本設定</h3>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded" placeholder="活動名稱" />
              <div className="grid grid-cols-2 gap-2">
                <select value={brand} onChange={(e) => setBrand(e.target.value as Brand)} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  <option value="health">健康 2.0</option>
                  <option value="supertaste">食尚玩家</option>
                  <option value="woman">女人我最大</option>
                </select>
                <select value={contentType} onChange={(e) => setContentType(e.target.value as CampaignContentType)} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  <option value="card">行銷卡片</option>
                  <option value="survey">問卷</option>
                  <option value="lottery">抽獎</option>
                  <option value="checkin">簽到</option>
                </select>
              </div>
              <div className="flex bg-slate-100 rounded p-1">
                <button onClick={() => setModuleType('inline')} className={`flex-1 rounded text-sm py-1.5 ${moduleType === 'inline' ? 'bg-white shadow-sm' : ''}`}>
                  Inline
                </button>
                <button onClick={() => setModuleType('popup')} className={`flex-1 rounded text-sm py-1.5 ${moduleType === 'popup' ? 'bg-white shadow-sm' : ''}`}>
                  Popup
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded" />
                <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded" />
              </div>
              <label className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 text-sm">
                <span>GA4 事件同步</span>
                <input type="checkbox" checked={ga4Sync} onChange={(e) => setGa4Sync(e.target.checked)} />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">模組設定與內容</h3>
              <div className="grid grid-cols-2 gap-2">
                <select value={templateTheme} onChange={(e) => setTemplateTheme(e.target.value as TemplateTheme)} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  <option value="default">模板：Default</option>
                  <option value="health">模板：Health</option>
                  <option value="warm">模板：Warm</option>
                </select>
                <select value={popupPosition} onChange={(e) => setPopupPosition(e.target.value as PopupPosition)} className="px-3 py-2 text-sm border border-slate-300 rounded" disabled={moduleType === 'inline'}>
                  <option value="bottom">Popup 位置：底部</option>
                  <option value="right-bottom">Popup 位置：右下</option>
                  <option value="left-bottom">Popup 位置：左下</option>
                </select>
              </div>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded" placeholder="標題" />
              <input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded" placeholder="副標題" />
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded" placeholder="CTA 文字" />
              {contentType === 'survey' &&
              <textarea
                value={surveyOptions}
                onChange={(e) => setSurveyOptions(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded"
                rows={3}
                placeholder="問卷選項（逗號分隔）" />
              }
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>觸發條件引擎</span>
              </h3>
              {triggers.map((item, idx) =>
              <input
                key={idx}
                value={item}
                onChange={(e) => setTriggers((prev) => prev.map((old, i) => i === idx ? e.target.value : old))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded"
                placeholder="例如：segment=糖尿病活躍讀者" />
              )}
              <button onClick={() => setTriggers((prev) => [...prev, ''])} className="text-sm text-brand-500">
                + 新增條件（頁面/屬性/行為/分群/時間）
              </button>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">統一頻控規則</h3>
              <label className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 text-sm">
                <span>已完成不再顯示</span>
                <input
                  type="checkbox"
                  checked={frequency.hideAfterComplete}
                  onChange={(e) => setFrequency((prev) => ({ ...prev, hideAfterComplete: e.target.checked }))} />
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="border border-slate-200 rounded px-2 py-2">
                  單日曝光上限
                  <input type="number" value={frequency.perDayLimit} onChange={(e) => setFrequency((prev) => ({ ...prev, perDayLimit: Number(e.target.value) || 0 }))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" />
                </label>
                <label className="border border-slate-200 rounded px-2 py-2">
                  全域單日上限
                  <input type="number" value={frequency.globalDailyLimit} onChange={(e) => setFrequency((prev) => ({ ...prev, globalDailyLimit: Number(e.target.value) || 0 }))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" />
                </label>
                <label className="border border-slate-200 rounded px-2 py-2">
                  冷卻期（小時）
                  <input type="number" value={frequency.cooldownHours} onChange={(e) => setFrequency((prev) => ({ ...prev, cooldownHours: Number(e.target.value) || 0 }))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" />
                </label>
                <label className="border border-slate-200 rounded px-2 py-2">
                  生命週期上限
                  <input type="number" value={frequency.lifetimeLimit} onChange={(e) => setFrequency((prev) => ({ ...prev, lifetimeLimit: Number(e.target.value) || 0 }))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" />
                </label>
              </div>
            </section>

            {contentType === 'lottery' &&
            <section className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">抽獎設定（庫存導向）</h3>
                <div className="flex bg-slate-100 rounded p-1 text-sm">
                  <button onClick={() => setLotteryMode('register')} className={`flex-1 rounded py-1.5 ${lotteryMode === 'register' ? 'bg-white shadow-sm' : ''}`}>
                    登記制
                  </button>
                  <button onClick={() => setLotteryMode('instant')} className={`flex-1 rounded py-1.5 ${lotteryMode === 'instant' ? 'bg-white shadow-sm' : ''}`}>
                    即時制
                  </button>
                </div>
                {prizes.map((prize, idx) =>
              <div key={prize.id} className="grid grid-cols-4 gap-2 text-xs">
                    <input
                  value={prize.name}
                  onChange={(e) =>
                  setPrizes((prev) => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                  placeholder="獎項" />
                    <input
                  type="number"
                  value={prize.stock}
                  onChange={(e) =>
                  setPrizes((prev) => prev.map((p, i) => i === idx ? { ...p, stock: Number(e.target.value) || 0 } : p))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                  placeholder="庫存" />
                    <input
                  type="number"
                  value={prize.remaining}
                  onChange={(e) =>
                  setPrizes((prev) => prev.map((p, i) => i === idx ? { ...p, remaining: Number(e.target.value) || 0 } : p))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                  placeholder="剩餘" />
                    <input
                  type="number"
                  value={prize.weight}
                  onChange={(e) =>
                  setPrizes((prev) => prev.map((p, i) => i === idx ? { ...p, weight: Number(e.target.value) || 0 } : p))
                  }
                  className="px-2 py-1 border border-slate-300 rounded"
                  placeholder="權重" />
                  </div>
              )}
                <button
                  onClick={() =>
                  setPrizes((prev) => [...prev, { id: crypto.randomUUID(), name: '新獎項', stock: 0, remaining: 0, weight: 10 }])
                  }
                  className="text-sm text-brand-500">
                  + 新增獎項
                </button>
              </section>
            }

            {contentType === 'checkin' &&
            <section className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">簽到設定</h3>
                <label className="text-xs block">
                  連續簽到週期（天）
                  <input
                  type="number"
                  value={checkinCycleDays}
                  onChange={(e) => setCheckinCycleDays(Number(e.target.value) || 1)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded" />
                </label>
                <label className="text-xs block">
                  達標獎勵（連動抽獎活動，選填）
                  <select
                  value={checkinRewardLotteryId}
                  onChange={(e) => setCheckinRewardLotteryId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm">
                    <option value="">不設定</option>
                    {campaigns.
                  filter((c) => c.contentType === 'lottery').
                  map((lottery) =>
                  <option key={lottery.id} value={lottery.id}>
                        {lottery.name}
                      </option>
                  )}
                  </select>
                </label>
              </section>
            }
          </div>

          <div className="flex-1 bg-slate-100 p-8">
            <div className="flex justify-end mb-3">
              <div className="bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-slate-100' : ''}`}>
                  <Smartphone className="w-4 h-4" />
                </button>
                <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-slate-100' : ''}`}>
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-4 ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
              <div className="text-xs text-slate-500 mb-3">
                {brandMap[brand]} | {moduleType} | {typeLabel(contentType)} | Popup: {popupPosition}
              </div>
              <div className={`mx-auto relative bg-white border border-slate-300 overflow-hidden ${previewDevice === 'mobile' ? 'w-[320px] h-[620px] rounded-[1.5rem]' : 'w-full h-[500px] rounded-xl'}`}>
                <div className="p-4 space-y-3">
                  <div className="h-6 w-2/3 bg-slate-200 rounded" />
                  <div className="h-28 bg-slate-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 w-4/5 bg-slate-200 rounded" />
                  </div>
                </div>

                {moduleType === 'inline' &&
                <div className={`absolute left-1/2 -translate-x-1/2 ${previewDevice === 'mobile' ? 'top-72 w-[88%]' : 'top-56 w-[75%]'}`}>
                    <div className="text-[10px] text-slate-500 mb-1">Inline 模組（內文中）</div>
                    {renderModuleCard(previewDevice === 'mobile')}
                  </div>
                }

                {moduleType === 'popup' &&
                <div className={`absolute ${popupPositionClass}`}>
                    <div className="text-[10px] text-slate-500 mb-1">Popup 模組（{popupPosition}）</div>
                    {renderModuleCard(previewDevice === 'mobile')}
                  </div>
                }
              </div>
              <div className="mt-3 text-xs text-slate-500">
                觸發條件：{triggers.filter(Boolean).join(' AND ') || '無'} ｜ 頻控：單日 {frequency.perDayLimit} 次、全域 {frequency.globalDailyLimit} 次、冷卻 {frequency.cooldownHours} 小時
              </div>
            </div>
          </div>
        </div>
      </div>);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">行銷活動</h1>
        <p className="text-slate-500">Engagement Core：Inline / Popup / 問卷 / 抽獎 / 簽到</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <button
            onClick={() => startEdit(null)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>建立行銷活動</span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋活動名稱..."
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-56" />
            </div>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as Brand | 'all')} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="all">全部 Brand</option>
              <option value="health">健康 2.0</option>
              <option value="supertaste">食尚玩家</option>
              <option value="woman">女人我最大</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CampaignContentType | 'all')} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="all">全部類型</option>
              <option value="card">卡片</option>
              <option value="survey">問卷</option>
              <option value="lottery">抽獎</option>
              <option value="checkin">簽到</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="all">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="scheduled">排程中</option>
              <option value="active">進行中</option>
              <option value="ended">已結束</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((campaign) =>
          <div key={campaign.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <TypeIcon type={campaign.contentType} />
                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="text-sm text-slate-500">
                    {brandMap[campaign.brand]} · {campaign.moduleType === 'inline' ? 'Inline 模組' : 'Popup 模組'} · {typeLabel(campaign.contentType)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    排程：{campaign.startAt.replace('T', ' ')} ~ {campaign.endAt.replace('T', ' ')} · GA4：{campaign.ga4Sync ? '已開啟' : '關閉'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setConfigPreviewCampaign(campaign)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-sm">
                    設定預覽
                  </button>
                  <button
                    onClick={() => setInspectCampaign(campaign)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-sm flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>成效</span>
                  </button>
                  <button onClick={() => startEdit(campaign)} className="px-3 py-1.5 bg-slate-100 rounded text-sm">
                    編輯
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  曝光數
                  <div className="font-semibold text-slate-900">{campaign.metrics.impressions.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  互動數
                  <div className="font-semibold text-slate-900">{campaign.metrics.interactions.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  完成數
                  <div className="font-semibold text-slate-900">{campaign.metrics.completions.toLocaleString()}</div>
                </div>
              </div>
              {campaign.contentType === 'lottery' && campaign.prizes &&
            <div className="mt-3 text-xs text-slate-600">
                  獎品庫存：{campaign.prizes.map((prize) => `${prize.name} ${prize.remaining}/${prize.stock}`).join(' ｜ ')}
                </div>
            }
            </div>
          )}
        </div>
      </div>

      {inspectCampaign &&
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{inspectCampaign.name} 成效</h2>
              <button onClick={() => setInspectCampaign(null)} className="text-slate-400 hover:text-slate-600">
                關閉
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-lg p-3">
                  曝光數<div className="font-semibold text-slate-900">{inspectCampaign.metrics.impressions.toLocaleString()}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  互動數<div className="font-semibold text-slate-900">{inspectCampaign.metrics.interactions.toLocaleString()}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  完成數<div className="font-semibold text-slate-900">{inspectCampaign.metrics.completions.toLocaleString()}</div>
                </div>
              </div>
              {inspectCampaign.contentType === 'survey' &&
            <div className="border border-slate-200 rounded-lg p-3">
                  完成率：{inspectCampaign.metrics.surveyAnswerRate ?? 0}%（含逐題流失分析欄位預留）
                </div>
            }
              {inspectCampaign.contentType === 'lottery' &&
            <div className="border border-slate-200 rounded-lg p-3">
                  中獎數：{inspectCampaign.metrics.lotteryWinners ?? 0} ｜ 模式：{inspectCampaign.lotteryMode === 'register' ? '登記制' : '即時制'}
                </div>
            }
              {inspectCampaign.contentType === 'checkin' &&
            <div className="border border-slate-200 rounded-lg p-3">
                  達標人數：{inspectCampaign.metrics.checkinGoalReached ?? 0} ｜ 週期：{inspectCampaign.checkinCycleDays ?? 7} 天
                </div>
            }
              <div className="text-xs text-slate-500">
                備註：GDPR、RBAC 與稽核操作在 System Admin 模組流程中驗證；此頁聚焦活動建立與成效。
              </div>
            </div>
          </div>
        </div>
      }

      {configPreviewCampaign &&
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{configPreviewCampaign.name} 行銷活動設定預覽</h2>
              <button onClick={() => setConfigPreviewCampaign(null)} className="text-slate-400 hover:text-slate-600">關閉</button>
            </div>
            <div className="p-6 text-sm space-y-3">
              <div>Brand：{brandMap[configPreviewCampaign.brand]}</div>
              <div>呈現方式：{configPreviewCampaign.moduleType} {configPreviewCampaign.moduleType === 'popup' ? `(${configPreviewCampaign.popupPosition})` : ''}</div>
              <div>模板：{configPreviewCampaign.templateTheme}</div>
              <div>觸發條件：{configPreviewCampaign.triggers.join(' AND ')}</div>
              <div className="text-xs text-slate-500">相對位置示意</div>
              <div className="relative h-64 border border-slate-300 rounded-xl bg-white overflow-hidden">
                <div className="p-3 space-y-2 opacity-70">
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-14 bg-slate-200 rounded" />
                  <div className="h-2 bg-slate-200 rounded" />
                  <div className="h-2 w-4/5 bg-slate-200 rounded" />
                </div>
                {configPreviewCampaign.moduleType === 'inline' &&
                <div className="absolute left-1/2 -translate-x-1/2 top-28 w-[82%]">
                    <div className="text-[10px] text-slate-500 mb-1">Inline 模組</div>
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs">{configPreviewCampaign.headline}</div>
                  </div>
                }
                {configPreviewCampaign.moduleType === 'popup' &&
                <div className={`absolute ${configPreviewCampaign.popupPosition === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-3 w-[86%]' : configPreviewCampaign.popupPosition === 'right-bottom' ? 'right-3 bottom-3 w-[62%]' : 'left-3 bottom-3 w-[62%]'}`}>
                    <div className="text-[10px] text-slate-500 mb-1">Popup 模組（{configPreviewCampaign.popupPosition}）</div>
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs">{configPreviewCampaign.headline}</div>
                  </div>
                }
              </div>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="font-semibold text-slate-900">{configPreviewCampaign.headline}</div>
                <div className="text-slate-600 mt-1">{configPreviewCampaign.subheadline}</div>
                {configPreviewCampaign.surveyOptions && configPreviewCampaign.surveyOptions.length > 0 &&
                <div className="mt-2 space-y-1">
                    {configPreviewCampaign.surveyOptions.slice(0, 4).map((opt) =>
                  <div key={opt} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded">
                        {opt}
                      </div>
                  )}
                  </div>
                }
                <button className="mt-3 px-3 py-1.5 text-xs bg-slate-900 text-white rounded">{configPreviewCampaign.ctaText}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);
}