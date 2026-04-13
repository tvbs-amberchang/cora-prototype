// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Journeys page — state orchestrator, composes JourneyList + JourneyCanvas

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { JourneyList, Journey } from './JourneyList';
import { JourneyCanvas } from './JourneyCanvas';

type JourneyStatus = 'draft' | 'active' | 'paused' | 'ended';
type TriggerType = 'event' | 'attribute' | 'schedule' | 'segment_enter';

const mockJourneys: Journey[] = [
  {
    id: '1',
    name: '沉睡用戶喚醒 (Push -> LINE降級)',
    triggerType: 'segment_enter',
    status: 'active',
    enteredCount: 1200,
    inProgressCount: 578,
    completedCount: 600,
    failedCount: 22,
    updatedAt: '10 分鐘前',
    startedAt: '2026-04-01 09:00',
  },
  {
    id: '2',
    name: '新註冊歡迎旅程 (3天)',
    triggerType: 'event',
    status: 'active',
    enteredCount: 8500,
    inProgressCount: 1200,
    completedCount: 7200,
    failedCount: 100,
    updatedAt: '1 小時前',
    startedAt: '2026-03-20 10:00',
  },
  {
    id: '3',
    name: '食尚玩家抽獎未中獎安撫',
    triggerType: 'event',
    status: 'draft',
    enteredCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    failedCount: 0,
    updatedAt: '2 天前',
  },
  {
    id: '4',
    name: '2025 雙11 預熱推播',
    triggerType: 'schedule',
    status: 'ended',
    enteredCount: 45000,
    inProgressCount: 0,
    completedCount: 44500,
    failedCount: 500,
    updatedAt: '3 個月前',
  },
];

export default function Journeys() {
  const [journeys, setJourneys] = useState<Journey[]>(mockJourneys);
  const [view, setView] = useState<'list' | 'setup' | 'canvas'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | 'all'>('all');
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  // Setup form state
  const [setupName, setSetupName] = useState('');
  const [setupTriggerType, setSetupTriggerType] = useState<TriggerType>('event');
  const [setupEntrySegment, setSetupEntrySegment] = useState('高互動會員');
  const [setupDescription, setSetupDescription] = useState('');

  const openSetup = (journey?: Journey) => {
    const draft: Journey = journey ?? {
      id: `draft_${Date.now()}`,
      name: `新旅程 ${journeys.length + 1}`,
      triggerType: 'event',
      status: 'draft',
      enteredCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      failedCount: 0,
      updatedAt: '剛剛',
    };
    setSelectedJourney(draft);
    setSetupName(draft.name);
    setSetupTriggerType(draft.triggerType);
    setSetupEntrySegment('高互動會員');
    setSetupDescription('');
    setView('setup');
  };

  const openCanvas = (journey: Journey) => {
    setSelectedJourney(journey);
    setView('canvas');
  };

  const saveSetupAndOpenCanvas = () => {
    const trimmedName = setupName.trim();
    if (!trimmedName) {
      alert('請先輸入旅程名稱。');
      return;
    }
    const base = selectedJourney ?? {
      id: `draft_${Date.now()}`,
      name: trimmedName,
      triggerType: setupTriggerType,
      status: 'draft' as JourneyStatus,
      enteredCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      failedCount: 0,
      updatedAt: '剛剛',
    };
    const next: Journey = {
      ...base,
      name: trimmedName,
      triggerType: setupTriggerType,
      status: base.status === 'ended' ? 'draft' : base.status,
      updatedAt: '剛剛',
    };
    setJourneys((prev) => {
      const exists = prev.some((j) => j.id === next.id);
      if (exists) return prev.map((j) => (j.id === next.id ? next : j));
      return [next, ...prev];
    });
    openCanvas(next);
  };

  const handleUpdateStatus = (status: JourneyStatus) => {
    if (!selectedJourney) return;
    const updated: Journey = {
      ...selectedJourney,
      status,
      updatedAt: '剛剛',
      startedAt: selectedJourney.startedAt ?? '2026-04-08 12:00',
    };
    setJourneys((prev) => prev.map((j) => (j.id === selectedJourney.id ? updated : j)));
    setSelectedJourney(updated);
  };

  // ---- Setup view ----
  if (view === 'setup' && selectedJourney) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center space-x-2 text-sm text-ph-secondary hover:text-ph-text mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>返回旅程列表</span>
          </button>
          <h1 className="text-2xl font-semibold text-ph-text tracking-tight mb-1">建立旅程 - 基本設定</h1>
          <p className="text-ph-secondary text-sm">先完成觸發與基本資訊，再進入畫布編排節點。</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ph-text mb-2">旅程名稱</label>
            <input
              type="text"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="例如：新註冊 7 日培養旅程"
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ph-text mb-2">觸發類型</label>
            <select
              value={setupTriggerType}
              onChange={(e) => setSetupTriggerType(e.target.value as TriggerType)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="event">行為觸發</option>
              <option value="attribute">屬性觸發</option>
              <option value="schedule">排程觸發</option>
              <option value="segment_enter">分群進入觸發</option>
            </select>
          </div>
          {setupTriggerType === 'segment_enter' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ph-text">進入分群</label>
              <input
                type="text"
                value={setupEntrySegment}
                onChange={(e) => setSetupEntrySegment(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                啟用時會建立此分群的基線快照，後續以「進入後變化」計算進件，避免回溯舊成員。
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ph-text mb-2">說明（選填）</label>
            <textarea
              rows={3}
              value={setupDescription}
              onChange={(e) => setSetupDescription(e.target.value)}
              placeholder="描述這條旅程的目的與成功指標"
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 border border-border text-ph-secondary rounded-md hover:bg-ph-surface transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={saveSetupAndOpenCanvas}
              className="px-4 py-2 bg-ph-text text-white rounded-md hover:bg-ph-text/90 transition-colors text-sm font-medium"
            >
              儲存並進入畫布
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Canvas view ----
  if (view === 'canvas' && selectedJourney) {
    return (
      <JourneyCanvas
        journey={selectedJourney}
        onBack={() => setView('list')}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  }

  // ---- List view ----
  return (
    <JourneyList
      journeys={journeys}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      onCreateJourney={() => openSetup()}
      onSetupJourney={openSetup}
      onOpenCanvas={openCanvas}
    />
  );
}
