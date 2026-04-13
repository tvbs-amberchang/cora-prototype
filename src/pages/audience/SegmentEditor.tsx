// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: 4-step segment creation/editing dialog with condition builder and estimate

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type GroupLogic,
  type GroupRelation,
  type Segment,
  type SegmentEditorPayload,
  type SegmentType,
  now,
} from './types';
import { ConditionBuilder } from './ConditionBuilder';

interface SegmentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SegmentEditorPayload) => void;
  mode: 'create' | 'edit';
  initialSegment?: Segment;
}

export const SegmentEditor = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialSegment,
}: SegmentEditorProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialSegment?.name ?? '');
  const [description, setDescription] = useState(initialSegment?.description ?? '');
  const [type, setType] = useState<SegmentType>(initialSegment?.type ?? 'dynamic');
  const [groupLogic, setGroupLogic] = useState<GroupLogic>(initialSegment?.groupLogic ?? 'AND');
  const [conditions, setConditions] = useState<string[]>(initialSegment?.conditions ?? ['']);
  const [relationToNextGroup, setRelationToNextGroup] = useState<GroupRelation>(
    initialSegment?.relationToNextGroup ?? 'AND'
  );
  const [secondaryGroupLogic, setSecondaryGroupLogic] = useState<GroupLogic>(
    initialSegment?.secondaryGroupLogic ?? 'AND'
  );
  const [secondaryConditions, setSecondaryConditions] = useState<string[]>(
    initialSegment?.secondaryConditions ?? []
  );
  const [nestedLevel, setNestedLevel] = useState<1 | 2 | 3>(initialSegment?.nestedLevel ?? 1);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [lastEstimateAt, setLastEstimateAt] = useState<number | null>(null);
  const [cooldownError, setCooldownError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName(initialSegment?.name ?? '');
      setDescription(initialSegment?.description ?? '');
      setType(initialSegment?.type ?? 'dynamic');
      setGroupLogic(initialSegment?.groupLogic ?? 'AND');
      setConditions(initialSegment?.conditions ?? ['']);
      setRelationToNextGroup(initialSegment?.relationToNextGroup ?? 'AND');
      setSecondaryGroupLogic(initialSegment?.secondaryGroupLogic ?? 'AND');
      setSecondaryConditions(initialSegment?.secondaryConditions ?? []);
      setNestedLevel(initialSegment?.nestedLevel ?? 1);
      setEstimatedCount(null);
      setIsEstimating(false);
      setLastEstimateAt(null);
      setCooldownError('');
    }
  }, [initialSegment, isOpen]);

  if (!isOpen) return null;

  const conditionCount =
    conditions.filter(Boolean).length + secondaryConditions.filter(Boolean).length;
  const overLimit = conditionCount > 20;

  const estimate = () => {
    const current = now();
    if (lastEstimateAt && current - lastEstimateAt < 60000) {
      const sec = Math.ceil((60000 - (current - lastEstimateAt)) / 1000);
      setCooldownError(`預估查詢頻率限制：請 ${sec} 秒後再試。`);
      return;
    }
    setCooldownError('');
    setIsEstimating(true);
    setLastEstimateAt(current);
    setTimeout(() => {
      const base = 18000;
      const density = Math.max(1, 24 - conditionCount);
      setEstimatedCount(Math.floor(base / density) * 100 + (type === 'dynamic' ? 250 : 0));
      setIsEstimating(false);
    }, 1100);
  };

  const submit = () => {
    if (!estimatedCount) {
      estimate();
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      groupLogic,
      conditions: conditions.filter(Boolean),
      relationToNextGroup: secondaryConditions.length > 0 ? relationToNextGroup : undefined,
      secondaryGroupLogic: secondaryConditions.length > 0 ? secondaryGroupLogic : undefined,
      secondaryConditions:
        secondaryConditions.length > 0 ? secondaryConditions.filter(Boolean) : undefined,
      nestedLevel,
      estimatedCount,
    });
    onClose();
  };

  const canProceed =
    !(step === 2 && !name.trim()) &&
    !(step === 3 && (overLimit || conditions.filter(Boolean).length === 0));

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-ph-text">
              {mode === 'create' ? '建立分群' : '編輯分群'}
            </h2>
            <p className="text-sm text-ph-secondary mt-1">Step {step} of 4</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-ph-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Type selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {(['dynamic', 'static'] as SegmentType[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`p-6 border-2 rounded-xl text-left transition-colors ${
                    type === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-ph-text mb-2">
                    {value === 'dynamic' ? '動態分群' : '靜態分群'}
                  </p>
                  <p className="text-sm text-ph-secondary">
                    {value === 'dynamic'
                      ? '系統分鐘級更新，條件不符自動移出。'
                      : '建立時計算一次，名單固定。'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Name + metadata */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ph-text mb-2">分群名稱</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：糖尿病活躍讀者"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ph-text mb-2">
                  分群說明（選填）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-md text-sm text-ph-text placeholder:text-ph-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述這個分群用途"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ph-text mb-2">
                  條件巢狀層級（最多 3）
                </label>
                <select
                  value={nestedLevel}
                  onChange={(e) => setNestedLevel(Number(e.target.value) as 1 | 2 | 3)}
                  className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white"
                >
                  <option value={1}>1 層</option>
                  <option value={2}>2 層</option>
                  <option value={3}>3 層</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Conditions */}
          {step === 3 && (
            <ConditionBuilder
              groupLogic={groupLogic}
              conditions={conditions}
              relationToNextGroup={relationToNextGroup}
              secondaryGroupLogic={secondaryGroupLogic}
              secondaryConditions={secondaryConditions}
              onGroupLogicChange={setGroupLogic}
              onConditionsChange={setConditions}
              onRelationToNextGroupChange={setRelationToNextGroup}
              onSecondaryGroupLogicChange={setSecondaryGroupLogic}
              onSecondaryConditionsChange={setSecondaryConditions}
              conditionCount={conditionCount}
              overLimit={overLimit}
            />
          )}

          {/* Step 4: Estimate */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-ph-surface border border-border rounded-lg p-6 text-center">
                {!estimatedCount && !isEstimating && (
                  <Button onClick={estimate}>預估人數</Button>
                )}
                {isEstimating && <p className="text-ph-secondary">計算中...</p>}
                {estimatedCount && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-3xl font-bold text-ph-text">
                        約 {estimatedCount.toLocaleString()} 人
                      </span>
                    </div>
                    <p className="text-sm text-ph-secondary">
                      品牌分佈為近似值，可能隨資料更新變化。
                    </p>
                  </div>
                )}
              </div>
              {cooldownError && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {cooldownError}
                </div>
              )}
              <div className="text-sm text-ph-secondary">
                預估查詢限制：每個分群每分鐘最多 1 次。
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-ph-surface">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
          >
            {step === 1 ? '取消' : '上一步'}
          </Button>
          <Button
            disabled={!canProceed}
            onClick={() => (step < 4 ? setStep(step + 1) : submit())}
          >
            {step === 4 ? (mode === 'create' ? '建立分群' : '儲存變更') : '下一步'}
          </Button>
        </div>
      </div>
    </div>
  );
};
