// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Campaigns page — composes CampaignList + CampaignEditor + metric/config dialogs

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CampaignList } from './CampaignList';
import { CampaignEditor } from './CampaignEditor';
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
  defaultCampaigns,
  typeLabel,
} from './types';

// ---- Default editor state ----
const DEFAULT_FREQUENCY: FrequencyControl = {
  hideAfterComplete: true,
  perDayLimit: 2,
  globalDailyLimit: 5,
  cooldownHours: 24,
  lifetimeLimit: 3,
};

const DEFAULT_PRIZES: Prize[] = [
  { id: crypto.randomUUID(), name: '大獎', stock: 100, remaining: 100, weight: 50 },
  { id: crypto.randomUUID(), name: '參加獎', stock: 500, remaining: 500, weight: 50 },
];

// ---- Metrics dialog ----
function MetricsDialog({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ph-text">{campaign.name} 成效</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>關閉</Button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '曝光數', value: campaign.metrics.impressions },
              { label: '互動數', value: campaign.metrics.interactions },
              { label: '完成數', value: campaign.metrics.completions },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border rounded-lg p-3">
                <div className="text-ph-secondary text-xs mb-1">{label}</div>
                <div className="font-semibold text-ph-text">{value.toLocaleString()}</div>
              </div>
            ))}
          </div>
          {campaign.contentType === 'survey' && (
            <div className="border border-border rounded-lg p-3 text-ph-secondary">
              完成率：{campaign.metrics.surveyAnswerRate ?? 0}%（含逐題流失分析欄位預留）
            </div>
          )}
          {campaign.contentType === 'lottery' && (
            <div className="border border-border rounded-lg p-3 text-ph-secondary">
              中獎數：{campaign.metrics.lotteryWinners ?? 0} ｜ 模式：{campaign.lotteryMode === 'register' ? '登記制' : '即時制'}
            </div>
          )}
          {campaign.contentType === 'checkin' && (
            <div className="border border-border rounded-lg p-3 text-ph-secondary">
              達標人數：{campaign.metrics.checkinGoalReached ?? 0} ｜ 週期：{campaign.checkinCycleDays ?? 7} 天
            </div>
          )}
          <p className="text-xs text-ph-muted">
            備註：GDPR、RBAC 與稽核操作在 System Admin 模組流程中驗證；此頁聚焦活動建立與成效。
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Config preview dialog ----
function ConfigPreviewDialog({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const popupClass =
    campaign.popupPosition === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-3 w-[86%]' :
    campaign.popupPosition === 'right-bottom' ? 'right-3 bottom-3 w-[62%]' :
    'left-3 bottom-3 w-[62%]';

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ph-text">{campaign.name} 行銷活動設定預覽</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>關閉</Button>
        </div>
        <div className="p-6 text-sm space-y-3 text-ph-secondary">
          <div>Brand：{brandMap[campaign.brand]}</div>
          <div>呈現方式：{campaign.moduleType} {campaign.moduleType === 'popup' ? `(${campaign.popupPosition})` : ''}</div>
          <div>模板：{campaign.templateTheme}</div>
          <div>觸發條件：{campaign.triggers.join(' AND ')}</div>
          <div className="text-xs text-ph-muted">相對位置示意</div>
          <div className="relative h-64 border border-border rounded-xl bg-background overflow-hidden">
            <div className="p-3 space-y-2 opacity-70">
              <div className="h-4 w-2/3 bg-ph-surface rounded" />
              <div className="h-14 bg-ph-surface rounded" />
              <div className="h-2 bg-ph-surface rounded" />
              <div className="h-2 w-4/5 bg-ph-surface rounded" />
            </div>
            {campaign.moduleType === 'inline' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-28 w-[82%]">
                <div className="text-[10px] text-ph-muted mb-1">Inline 模組</div>
                <div className="border border-border rounded-lg p-2 bg-ph-surface text-xs text-ph-text">{campaign.headline}</div>
              </div>
            )}
            {campaign.moduleType === 'popup' && (
              <div className={`absolute ${popupClass}`}>
                <div className="text-[10px] text-ph-muted mb-1">Popup 模組（{campaign.popupPosition}）</div>
                <div className="border border-border rounded-lg p-2 bg-ph-surface text-xs text-ph-text">{campaign.headline}</div>
              </div>
            )}
          </div>
          <div className="border border-border rounded-lg p-4 bg-ph-surface">
            <div className="font-semibold text-ph-text">{campaign.headline}</div>
            <div className="text-ph-secondary mt-1 text-sm">{campaign.subheadline}</div>
            {campaign.surveyOptions && campaign.surveyOptions.length > 0 && (
              <div className="mt-2 space-y-1">
                {campaign.surveyOptions.slice(0, 4).map((opt) => (
                  <div key={opt} className="text-xs px-2 py-1 bg-background border border-border rounded text-ph-text">{opt}</div>
                ))}
              </div>
            )}
            <button className="mt-3 px-3 py-1.5 text-xs bg-ph-text text-white rounded">{campaign.ctaText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main Campaigns page ----
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [inspectCampaign, setInspectCampaign] = useState<Campaign | null>(null);
  const [configPreviewCampaign, setConfigPreviewCampaign] = useState<Campaign | null>(null);

  // Editor state
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [name, setName] = useState('新活動');
  const [brand, setBrand] = useState<Brand>('health');
  const [contentType, setContentType] = useState<CampaignContentType>('survey');
  const [moduleType, setModuleType] = useState<ModuleType>('popup');
  const [startAt, setStartAt] = useState('2026-04-10T09:00');
  const [endAt, setEndAt] = useState('2026-04-30T23:00');
  const [ga4Sync, setGa4Sync] = useState(false);
  const [triggers, setTriggers] = useState<string[]>(['brand=health']);
  const [frequency, setFrequency] = useState<FrequencyControl>(DEFAULT_FREQUENCY);
  const [lotteryMode, setLotteryMode] = useState<LotteryMode>('instant');
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [checkinCycleDays, setCheckinCycleDays] = useState(7);
  const [checkinRewardLotteryId, setCheckinRewardLotteryId] = useState('');
  const [popupPosition, setPopupPosition] = useState<PopupPosition>('bottom');
  const [templateTheme, setTemplateTheme] = useState<TemplateTheme>('default');
  const [headline, setHeadline] = useState('活動標題');
  const [subheadline, setSubheadline] = useState('活動副標');
  const [ctaText, setCtaText] = useState('立即參加');
  const [surveyOptions, setSurveyOptions] = useState('選項 A, 選項 B');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

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
    setFrequency(DEFAULT_FREQUENCY);
    setLotteryMode('instant');
    setPrizes([{ id: crypto.randomUUID(), name: '大獎', stock: 100, remaining: 100, weight: 50 }]);
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
      metrics: editing?.metrics ?? { impressions: 0, interactions: 0, completions: 0 },
      lotteryMode: contentType === 'lottery' ? lotteryMode : undefined,
      prizes: contentType === 'lottery' ? prizes : undefined,
      checkinCycleDays: contentType === 'checkin' ? checkinCycleDays : undefined,
      checkinRewardLinkedLotteryId: contentType === 'checkin' && checkinRewardLotteryId ? checkinRewardLotteryId : undefined,
      popupPosition,
      templateTheme,
      headline,
      subheadline,
      ctaText,
      surveyOptions: contentType === 'survey' ? surveyOptions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    };
    setCampaigns((prev) => editing ? prev.map((c) => (c.id === editing.id ? payload : c)) : [payload, ...prev]);
    setView('list');
    resetEditor();
  };

  if (view === 'edit') {
    return (
      <CampaignEditor
        editing={editing}
        name={name} brand={brand} contentType={contentType} moduleType={moduleType}
        startAt={startAt} endAt={endAt} ga4Sync={ga4Sync} triggers={triggers}
        frequency={frequency} lotteryMode={lotteryMode} prizes={prizes}
        checkinCycleDays={checkinCycleDays} checkinRewardLotteryId={checkinRewardLotteryId}
        popupPosition={popupPosition} templateTheme={templateTheme}
        headline={headline} subheadline={subheadline} ctaText={ctaText}
        surveyOptions={surveyOptions} previewDevice={previewDevice}
        lotteryOptions={campaigns.filter((c) => c.contentType === 'lottery')}
        setName={setName} setBrand={setBrand} setContentType={setContentType}
        setModuleType={setModuleType} setStartAt={setStartAt} setEndAt={setEndAt}
        setGa4Sync={setGa4Sync} setTriggers={setTriggers} setFrequency={setFrequency}
        setLotteryMode={setLotteryMode} setPrizes={setPrizes}
        setCheckinCycleDays={setCheckinCycleDays}
        setCheckinRewardLotteryId={setCheckinRewardLotteryId}
        setPopupPosition={setPopupPosition} setTemplateTheme={setTemplateTheme}
        setHeadline={setHeadline} setSubheadline={setSubheadline} setCtaText={setCtaText}
        setSurveyOptions={setSurveyOptions} setPreviewDevice={setPreviewDevice}
        onBack={() => { setView('list'); resetEditor(); }}
        onSave={saveCampaign}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 ">
      <PageHeader title="行銷活動" description="Engagement Core：Inline / Popup / 問卷 / 抽獎 / 簽到" />

      <CampaignList
        campaigns={campaigns}
        onCreateNew={() => startEdit(null)}
        onEdit={startEdit}
        onInspect={setInspectCampaign}
        onConfigPreview={setConfigPreviewCampaign}
      />

      {inspectCampaign && (
        <MetricsDialog campaign={inspectCampaign} onClose={() => setInspectCampaign(null)} />
      )}
      {configPreviewCampaign && (
        <ConfigPreviewDialog campaign={configPreviewCampaign} onClose={() => setConfigPreviewCampaign(null)} />
      )}
    </div>
  );
}
