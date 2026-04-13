// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Campaign create/edit form with live module preview

import React from 'react';
import { ChevronLeft, Monitor, Smartphone, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type Brand,
  type Campaign,
  type CampaignContentType,
  type CampaignStatus,
  type FrequencyControl,
  type LotteryMode,
  type ModuleType,
  type PopupPosition,
  type Prize,
  type TemplateTheme,
  brandMap,
  typeLabel,
} from './types';

interface EditorState {
  editing: Campaign | null;
  name: string;
  brand: Brand;
  contentType: CampaignContentType;
  moduleType: ModuleType;
  startAt: string;
  endAt: string;
  ga4Sync: boolean;
  triggers: string[];
  frequency: FrequencyControl;
  lotteryMode: LotteryMode;
  prizes: Prize[];
  checkinCycleDays: number;
  checkinRewardLotteryId: string;
  popupPosition: PopupPosition;
  templateTheme: TemplateTheme;
  headline: string;
  subheadline: string;
  ctaText: string;
  surveyOptions: string;
  previewDevice: 'mobile' | 'desktop';
}

interface EditorActions {
  setName: (v: string) => void;
  setBrand: (v: Brand) => void;
  setContentType: (v: CampaignContentType) => void;
  setModuleType: (v: ModuleType) => void;
  setStartAt: (v: string) => void;
  setEndAt: (v: string) => void;
  setGa4Sync: (v: boolean) => void;
  setTriggers: (fn: (prev: string[]) => string[]) => void;
  setFrequency: (fn: (prev: FrequencyControl) => FrequencyControl) => void;
  setLotteryMode: (v: LotteryMode) => void;
  setPrizes: (fn: (prev: Prize[]) => Prize[]) => void;
  setCheckinCycleDays: (v: number) => void;
  setCheckinRewardLotteryId: (v: string) => void;
  setPopupPosition: (v: PopupPosition) => void;
  setTemplateTheme: (v: TemplateTheme) => void;
  setHeadline: (v: string) => void;
  setSubheadline: (v: string) => void;
  setCtaText: (v: string) => void;
  setSurveyOptions: (v: string) => void;
  setPreviewDevice: (v: 'mobile' | 'desktop') => void;
  onBack: () => void;
  onSave: (status: CampaignStatus) => void;
  lotteryOptions: Campaign[];
}

type Props = EditorState & EditorActions;

export function CampaignEditor(props: Props) {
  const {
    editing, name, brand, contentType, moduleType, startAt, endAt, ga4Sync,
    triggers, frequency, lotteryMode, prizes, checkinCycleDays, checkinRewardLotteryId,
    popupPosition, templateTheme, headline, subheadline, ctaText, surveyOptions,
    previewDevice, lotteryOptions,
    setName, setBrand, setContentType, setModuleType, setStartAt, setEndAt, setGa4Sync,
    setTriggers, setFrequency, setLotteryMode, setPrizes, setCheckinCycleDays,
    setCheckinRewardLotteryId, setPopupPosition, setTemplateTheme, setHeadline,
    setSubheadline, setCtaText, setSurveyOptions, setPreviewDevice, onBack, onSave,
  } = props;

  const themeClass =
    templateTheme === 'health' ? 'bg-emerald-50 border-emerald-200' :
    templateTheme === 'warm' ? 'bg-amber-50 border-amber-200' :
    'bg-ph-surface border-border';

  const popupPositionClass =
    popupPosition === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-4 w-[88%]' :
    popupPosition === 'right-bottom' ? 'right-4 bottom-4 w-[70%]' :
    'left-4 bottom-4 w-[70%]';

  const renderModuleCard = (compact = false) => (
    <div className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} ${themeClass}`}>
      <div className={`font-semibold text-ph-text ${compact ? 'text-sm' : 'text-base'}`}>{headline}</div>
      <div className={`text-ph-secondary mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>{subheadline}</div>
      {contentType === 'survey' && (
        <div className="mt-2 space-y-1">
          {surveyOptions.split(',').map((opt) => opt.trim()).filter(Boolean).slice(0, compact ? 2 : 3).map((opt) => (
            <div key={opt} className={`px-2 py-1 bg-white border border-border rounded ${compact ? 'text-[11px]' : 'text-xs'}`}>{opt}</div>
          ))}
        </div>
      )}
      {contentType === 'lottery' && (
        <div className={`${compact ? 'text-[11px]' : 'text-xs'} mt-2 text-ph-secondary`}>
          {lotteryMode === 'register' ? '登記制' : '即時制'} · 獎項 {prizes.length} 個
        </div>
      )}
      {contentType === 'checkin' && (
        <div className={`${compact ? 'text-[11px]' : 'text-xs'} mt-2 text-ph-secondary`}>
          連續 {checkinCycleDays} 天
        </div>
      )}
      <button className={`mt-2 px-3 py-1.5 bg-ph-text text-white rounded ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {ctaText}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-ph-surface">
      {/* Editor header */}
      <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 hover:bg-ph-surface rounded text-ph-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-ph-text">
            {editing ? '編輯行銷活動' : '建立行銷活動'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSave('draft')}>
            儲存草稿
          </Button>
          <Button size="sm" onClick={() => onSave('scheduled')}>
            發佈並排程
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Form panel */}
        <div className="w-[470px] bg-background border-r border-border overflow-y-auto p-6 space-y-7 shrink-0">
          {/* Basic settings */}
          <section className="space-y-3">
            <h3 className="font-semibold text-ph-text text-sm">基本設定</h3>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="活動名稱" className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as Brand)}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
              >
                <option value="health">健康 2.0</option>
                <option value="supertaste">食尚玩家</option>
                <option value="woman">女人我最大</option>
              </select>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as CampaignContentType)}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
              >
                <option value="card">行銷卡片</option>
                <option value="survey">問卷</option>
                <option value="lottery">抽獎</option>
                <option value="checkin">簽到</option>
              </select>
            </div>
            <div className="flex bg-ph-surface rounded p-1 border border-border">
              <button
                onClick={() => setModuleType('inline')}
                className={`flex-1 rounded text-sm py-1.5 transition-colors ${moduleType === 'inline' ? 'bg-background shadow-sm text-ph-text' : 'text-ph-secondary'}`}
              >
                Inline
              </button>
              <button
                onClick={() => setModuleType('popup')}
                className={`flex-1 rounded text-sm py-1.5 transition-colors ${moduleType === 'popup' ? 'bg-background shadow-sm text-ph-text' : 'text-ph-secondary'}`}
              >
                Popup
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
              />
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
              />
            </div>
            <label className="flex items-center justify-between border border-border rounded-md px-3 py-2 text-sm text-ph-text">
              <span>GA4 事件同步</span>
              <input type="checkbox" checked={ga4Sync} onChange={(e) => setGa4Sync(e.target.checked)} />
            </label>
          </section>

          {/* Module & content settings */}
          <section className="space-y-3">
            <h3 className="font-semibold text-ph-text text-sm">模組設定與內容</h3>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={templateTheme}
                onChange={(e) => setTemplateTheme(e.target.value as TemplateTheme)}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text"
              >
                <option value="default">模板：Default</option>
                <option value="health">模板：Health</option>
                <option value="warm">模板：Warm</option>
              </select>
              <select
                value={popupPosition}
                onChange={(e) => setPopupPosition(e.target.value as PopupPosition)}
                disabled={moduleType === 'inline'}
                className="h-9 px-3 text-sm border border-border rounded-md bg-background text-ph-text disabled:opacity-50"
              >
                <option value="bottom">Popup 位置：底部</option>
                <option value="right-bottom">Popup 位置：右下</option>
                <option value="left-bottom">Popup 位置：左下</option>
              </select>
            </div>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="標題" className="text-sm" />
            <Input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="副標題" className="text-sm" />
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="CTA 文字" className="text-sm" />
            {contentType === 'survey' && (
              <textarea
                value={surveyOptions}
                onChange={(e) => setSurveyOptions(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ph-text"
                rows={3}
                placeholder="問卷選項（逗號分隔）"
              />
            )}
          </section>

          {/* Trigger engine */}
          <section className="space-y-3">
            <h3 className="font-semibold text-ph-text text-sm flex items-center gap-1">
              <Target className="w-4 h-4" />
              觸發條件引擎
            </h3>
            {triggers.map((item, idx) => (
              <Input
                key={idx}
                value={item}
                onChange={(e) => setTriggers((prev) => prev.map((old, i) => (i === idx ? e.target.value : old)))}
                placeholder="例如：segment=糖尿病活躍讀者"
                className="text-sm"
              />
            ))}
            <button
              onClick={() => setTriggers((prev) => [...prev, ''])}
              className="text-sm text-primary hover:underline"
            >
              + 新增條件（頁面/屬性/行為/分群/時間）
            </button>
          </section>

          {/* Frequency control */}
          <section className="space-y-3">
            <h3 className="font-semibold text-ph-text text-sm">統一頻控規則</h3>
            <label className="flex items-center justify-between border border-border rounded-md px-3 py-2 text-sm text-ph-text">
              <span>已完成不再顯示</span>
              <input
                type="checkbox"
                checked={frequency.hideAfterComplete}
                onChange={(e) => setFrequency((prev) => ({ ...prev, hideAfterComplete: e.target.checked }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '單日曝光上限', key: 'perDayLimit' as const },
                { label: '全域單日上限', key: 'globalDailyLimit' as const },
                { label: '冷卻期（小時）', key: 'cooldownHours' as const },
                { label: '生命週期上限', key: 'lifetimeLimit' as const },
              ].map(({ label, key }) => (
                <label key={key} className="border border-border rounded-md px-2 py-2 text-ph-secondary">
                  {label}
                  <input
                    type="number"
                    value={frequency[key]}
                    onChange={(e) => setFrequency((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))}
                    className="mt-1 w-full px-2 py-1 border border-border rounded text-ph-text bg-background"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Lottery settings */}
          {contentType === 'lottery' && (
            <section className="space-y-3">
              <h3 className="font-semibold text-ph-text text-sm">抽獎設定（庫存導向）</h3>
              <div className="flex bg-ph-surface rounded p-1 border border-border text-sm">
                <button
                  onClick={() => setLotteryMode('register')}
                  className={`flex-1 rounded py-1.5 transition-colors ${lotteryMode === 'register' ? 'bg-background shadow-sm text-ph-text' : 'text-ph-secondary'}`}
                >
                  登記制
                </button>
                <button
                  onClick={() => setLotteryMode('instant')}
                  className={`flex-1 rounded py-1.5 transition-colors ${lotteryMode === 'instant' ? 'bg-background shadow-sm text-ph-text' : 'text-ph-secondary'}`}
                >
                  即時制
                </button>
              </div>
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="grid grid-cols-4 gap-2 text-xs">
                  <input
                    value={prize.name}
                    onChange={(e) => setPrizes((prev) => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))}
                    className="px-2 py-1 border border-border rounded bg-background text-ph-text"
                    placeholder="獎項"
                  />
                  <input
                    type="number"
                    value={prize.stock}
                    onChange={(e) => setPrizes((prev) => prev.map((p, i) => (i === idx ? { ...p, stock: Number(e.target.value) || 0 } : p)))}
                    className="px-2 py-1 border border-border rounded bg-background text-ph-text"
                    placeholder="庫存"
                  />
                  <input
                    type="number"
                    value={prize.remaining}
                    onChange={(e) => setPrizes((prev) => prev.map((p, i) => (i === idx ? { ...p, remaining: Number(e.target.value) || 0 } : p)))}
                    className="px-2 py-1 border border-border rounded bg-background text-ph-text"
                    placeholder="剩餘"
                  />
                  <input
                    type="number"
                    value={prize.weight}
                    onChange={(e) => setPrizes((prev) => prev.map((p, i) => (i === idx ? { ...p, weight: Number(e.target.value) || 0 } : p)))}
                    className="px-2 py-1 border border-border rounded bg-background text-ph-text"
                    placeholder="權重"
                  />
                </div>
              ))}
              <button
                onClick={() => setPrizes((prev) => [...prev, { id: crypto.randomUUID(), name: '新獎項', stock: 0, remaining: 0, weight: 10 }])}
                className="text-sm text-primary hover:underline"
              >
                + 新增獎項
              </button>
            </section>
          )}

          {/* Checkin settings */}
          {contentType === 'checkin' && (
            <section className="space-y-3">
              <h3 className="font-semibold text-ph-text text-sm">簽到設定</h3>
              <label className="text-xs text-ph-secondary block">
                連續簽到週期（天）
                <input
                  type="number"
                  value={checkinCycleDays}
                  onChange={(e) => setCheckinCycleDays(Number(e.target.value) || 1)}
                  className="mt-1 w-full h-9 px-3 border border-border rounded-md bg-background text-ph-text"
                />
              </label>
              <label className="text-xs text-ph-secondary block">
                達標獎勵（連動抽獎活動，選填）
                <select
                  value={checkinRewardLotteryId}
                  onChange={(e) => setCheckinRewardLotteryId(e.target.value)}
                  className="mt-1 w-full h-9 px-3 border border-border rounded-md bg-background text-ph-text text-sm"
                >
                  <option value="">不設定</option>
                  {lotteryOptions.map((lottery) => (
                    <option key={lottery.id} value={lottery.id}>{lottery.name}</option>
                  ))}
                </select>
              </label>
            </section>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex-1 bg-ph-surface p-8 overflow-auto">
          <div className="flex justify-end mb-3">
            <div className="bg-background border border-border rounded-lg p-1 flex">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded transition-colors ${previewDevice === 'mobile' ? 'bg-ph-surface' : ''}`}
              >
                <Smartphone className="w-4 h-4 text-ph-secondary" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded transition-colors ${previewDevice === 'desktop' ? 'bg-ph-surface' : ''}`}
              >
                <Monitor className="w-4 h-4 text-ph-secondary" />
              </button>
            </div>
          </div>
          <div className={`mx-auto bg-background border border-border shadow-sm rounded-xl p-4 ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
            <div className="text-xs text-ph-muted mb-3">
              {brandMap[brand]} | {moduleType} | {typeLabel(contentType)} | Popup: {popupPosition}
            </div>
            <div className={`mx-auto relative bg-background border border-border overflow-hidden ${previewDevice === 'mobile' ? 'w-[320px] h-[620px] rounded-[1.5rem]' : 'w-full h-[500px] rounded-xl'}`}>
              <div className="p-4 space-y-3">
                <div className="h-6 w-2/3 bg-ph-surface rounded" />
                <div className="h-28 bg-ph-surface rounded" />
                <div className="space-y-2">
                  <div className="h-3 bg-ph-surface rounded" />
                  <div className="h-3 bg-ph-surface rounded" />
                  <div className="h-3 w-4/5 bg-ph-surface rounded" />
                </div>
              </div>
              {moduleType === 'inline' && (
                <div className={`absolute left-1/2 -translate-x-1/2 ${previewDevice === 'mobile' ? 'top-72 w-[88%]' : 'top-56 w-[75%]'}`}>
                  <div className="text-[10px] text-ph-muted mb-1">Inline 模組（內文中）</div>
                  {renderModuleCard(previewDevice === 'mobile')}
                </div>
              )}
              {moduleType === 'popup' && (
                <div className={`absolute ${popupPositionClass}`}>
                  <div className="text-[10px] text-ph-muted mb-1">Popup 模組（{popupPosition}）</div>
                  {renderModuleCard(previewDevice === 'mobile')}
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-ph-muted">
              觸發條件：{triggers.filter(Boolean).join(' AND ') || '無'} ｜ 頻控：單日 {frequency.perDayLimit} 次、全域 {frequency.globalDailyLimit} 次、冷卻 {frequency.cooldownHours} 小時
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
