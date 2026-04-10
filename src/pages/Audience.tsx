import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Users,
  X } from
'lucide-react';

type SegmentStatus = 'draft' | 'active' | 'paused' | 'archived';
type SegmentType = 'dynamic' | 'static';
type UserRole = 'system_admin' | 'marketer';
type GroupRelation = 'AND' | 'OR' | 'AND NOT';
type GroupLogic = 'AND' | 'OR';

interface Segment {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  status: SegmentStatus;
  memberCount: number;
  updatedAt: number;
  createdBy: string;
  conditions: string[];
  groupLogic: GroupLogic;
  relationToNextGroup?: GroupRelation;
  secondaryConditions?: string[];
  secondaryGroupLogic?: GroupLogic;
  nestedLevel: 1 | 2 | 3;
  referencedBy: number;
  ageDays: number;
}

interface SegmentEditorPayload {
  name: string;
  description?: string;
  type: SegmentType;
  groupLogic: GroupLogic;
  conditions: string[];
  relationToNextGroup?: GroupRelation;
  secondaryConditions?: string[];
  secondaryGroupLogic?: GroupLogic;
  nestedLevel: 1 | 2 | 3;
  estimatedCount: number;
}

interface ExportJob {
  id: string;
  source: string;
  rowCount: number;
  fields: string[];
  includePII: boolean;
  createdAt: number;
  expiresAt: number;
}

const now = () => Date.now();
const formatRelative = (timestamp: number) => {
  const diffMin = Math.floor((now() - timestamp) / 60000);
  if (diffMin < 1) return '剛剛';
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小時前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} 天前`;
};

const countConditions = (segment: Pick<Segment, 'conditions' | 'secondaryConditions'>) =>
(segment.conditions.length + (segment.secondaryConditions?.length ?? 0));

const defaultSegments: Segment[] = [
{
  id: 's1',
  name: '糖尿病活躍讀者',
  description: '近 7 天閱讀糖尿病內容達 3 次以上',
  type: 'dynamic',
  status: 'active',
  memberCount: 12350,
  updatedAt: now() - 2 * 60000,
  createdBy: '張小明',
  conditions: [
  '用戶屬性｜興趣偏好｜包含｜糖尿病',
  '行為｜page_view(content_category=糖尿病)｜≥ 3 次｜近 7 天'],
  groupLogic: 'AND',
  nestedLevel: 2,
  referencedBy: 3,
  ageDays: 12
},
{
  id: 's2',
  name: 'App 開啟但不點推播',
  description: '近 7 天有開 App，近 30 天未點推播',
  type: 'dynamic',
  status: 'active',
  memberCount: 8200,
  updatedAt: now() - 15 * 60000,
  createdBy: '李美華',
  conditions: ['行為｜app_open｜≥ 1 次｜近 7 天'],
  groupLogic: 'AND',
  relationToNextGroup: 'AND NOT',
  secondaryConditions: ['行為｜notification_click｜≥ 1 次｜近 30 天'],
  secondaryGroupLogic: 'AND',
  nestedLevel: 3,
  referencedBy: 0,
  ageDays: 5
},
{
  id: 's3',
  name: '2026 Q1 活動快照',
  description: '一次性活動名單快照',
  type: 'static',
  status: 'active',
  memberCount: 45600,
  updatedAt: now() - 3 * 24 * 60 * 60000,
  createdBy: '王大明',
  conditions: [
  '用戶屬性｜registration_brand｜=｜supertaste',
  '用戶屬性｜registration_date｜介於｜2026-03-01 ~ 2026-03-31'],
  groupLogic: 'AND',
  nestedLevel: 1,
  referencedBy: 0,
  ageDays: 66
},
{
  id: 's4',
  name: 'iOS 推播已開啟用戶',
  description: 'iOS 且推播權限為是',
  type: 'dynamic',
  status: 'paused',
  memberCount: 23400,
  updatedAt: now() - 7 * 24 * 60 * 60000,
  createdBy: '陳小華',
  conditions: ['用戶屬性｜platform｜=｜ios', '用戶屬性｜channel_opt_in.push｜=｜是'],
  groupLogic: 'AND',
  nestedLevel: 1,
  referencedBy: 1,
  ageDays: 40
}];

const statusMap: Record<SegmentStatus, {label: string;color: string;}> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
  active: { label: '啟用中', color: 'bg-green-100 text-green-700' },
  paused: { label: '已暫停', color: 'bg-yellow-100 text-yellow-700' },
  archived: { label: '已封存', color: 'bg-slate-200 text-slate-600' }
};

const typeMap: Record<SegmentType, {label: string;color: string;}> = {
  dynamic: { label: '動態', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  static: { label: '靜態', color: 'bg-purple-50 text-purple-700 border border-purple-200' }
};

const StatusBadge = ({ status }: {status: SegmentStatus;}) =>
<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status].color}`}>
    {statusMap[status].label}
  </span>;

const TypeBadge = ({ type }: {type: SegmentType;}) =>
<span className={`px-2 py-1 rounded-full text-xs font-medium ${typeMap[type].color}`}>
    {typeMap[type].label}
  </span>;

const ConditionEditor = ({
  title,
  logic,
  conditions,
  onLogicChange,
  onConditionsChange,
  canAddMore
}: {
  title: string;
  logic: GroupLogic;
  conditions: string[];
  onLogicChange: (value: GroupLogic) => void;
  onConditionsChange: (value: string[]) => void;
  canAddMore: boolean;
}) => {
  const updateAt = (index: number, value: string) => {
    const copied = [...conditions];
    copied[index] = value;
    onConditionsChange(copied);
  };
  const removeAt = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-slate-700">{title}</span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">群組邏輯</span>
          <select
            value={logic}
            onChange={(e) => onLogicChange(e.target.value as GroupLogic)}
            className="px-2 py-1 border border-wf-border rounded bg-white">
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
      </div>
      {conditions.map((condition, idx) =>
      <div key={`${title}-${idx}`} className="flex items-center space-x-2">
          <input
          value={condition}
          onChange={(e) => updateAt(idx, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-wf-border rounded bg-white"
          placeholder="例如：行為｜page_view｜≥ 3 次｜近 7 天" />
        
          <button
          onClick={() => removeAt(idx)}
          className="px-2 py-2 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50">
            刪除
          </button>
        </div>
      )}
      <button
        disabled={!canAddMore}
        onClick={() => onConditionsChange([...conditions, ''])}
        className="text-sm text-brand-500 disabled:text-slate-400">
        + 新增條件
      </button>
    </div>);
};

const SegmentEditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialSegment
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SegmentEditorPayload) => void;
  mode: 'create' | 'edit';
  initialSegment?: Segment;
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialSegment?.name ?? '');
  const [description, setDescription] = useState(initialSegment?.description ?? '');
  const [type, setType] = useState<SegmentType>(initialSegment?.type ?? 'dynamic');
  const [groupLogic, setGroupLogic] = useState<GroupLogic>(initialSegment?.groupLogic ?? 'AND');
  const [conditions, setConditions] = useState<string[]>(initialSegment?.conditions ?? ['']);
  const [relationToNextGroup, setRelationToNextGroup] = useState<GroupRelation>(initialSegment?.relationToNextGroup ?? 'AND');
  const [secondaryGroupLogic, setSecondaryGroupLogic] = useState<GroupLogic>(initialSegment?.secondaryGroupLogic ?? 'AND');
  const [secondaryConditions, setSecondaryConditions] = useState<string[]>(initialSegment?.secondaryConditions ?? []);
  const [nestedLevel, setNestedLevel] = useState<1 | 2 | 3>(initialSegment?.nestedLevel ?? 1);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [lastEstimateAt, setLastEstimateAt] = useState<number | null>(null);
  const [cooldownError, setCooldownError] = useState('');
  const hasSecondaryGroup = secondaryConditions.length > 0;

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
  const conditionCount = conditions.filter(Boolean).length + secondaryConditions.filter(Boolean).length;
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
      relationToNextGroup: hasSecondaryGroup ? relationToNextGroup : undefined,
      secondaryGroupLogic: hasSecondaryGroup ? secondaryGroupLogic : undefined,
      secondaryConditions: hasSecondaryGroup ? secondaryConditions.filter(Boolean) : undefined,
      nestedLevel,
      estimatedCount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'create' ? '建立分群' : '編輯分群'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 &&
          <div className="grid grid-cols-2 gap-4">
              {(['dynamic', 'static'] as SegmentType[]).map((value) =>
            <button
              key={value}
              onClick={() => setType(value)}
              className={`p-6 border-2 rounded-xl text-left ${type === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <p className="font-semibold text-slate-900 mb-2">{value === 'dynamic' ? '動態分群' : '靜態分群'}</p>
                  <p className="text-sm text-slate-600">
                    {value === 'dynamic' ? '系統分鐘級更新，條件不符自動移出。' : '建立時計算一次，名單固定。'}
                  </p>
                </button>
            )}
            </div>
          }
          {step === 2 &&
          <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分群名稱
                </label>
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-wf-border rounded"
                placeholder="例如：糖尿病活躍讀者" />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分群說明（選填）
                </label>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-wf-border rounded"
                placeholder="描述這個分群用途" />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  條件巢狀層級（最多 3）
                </label>
                <select
                value={nestedLevel}
                onChange={(e) => setNestedLevel(Number(e.target.value) as 1 | 2 | 3)}
                className="px-3 py-2 border border-wf-border rounded">
                  <option value={1}>1 層</option>
                  <option value={2}>2 層</option>
                  <option value={3}>3 層</option>
                </select>
              </div>
            </div>
          }
          {step === 3 &&
          <div className="space-y-4">
              <ConditionEditor
              title="條件組 A"
              logic={groupLogic}
              conditions={conditions}
              onLogicChange={setGroupLogic}
              onConditionsChange={setConditions}
              canAddMore={conditionCount < 20} />
            
              {hasSecondaryGroup &&
            <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">條件組關係</span>
                  <select
                value={relationToNextGroup}
                onChange={(e) => setRelationToNextGroup(e.target.value as GroupRelation)}
                className="px-3 py-1 border border-slate-300 rounded-full text-sm bg-white">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="AND NOT">AND NOT</option>
                  </select>
                </div>
            }
              {hasSecondaryGroup &&
            <ConditionEditor
              title="條件組 B"
              logic={secondaryGroupLogic}
              conditions={secondaryConditions}
              onLogicChange={setSecondaryGroupLogic}
              onConditionsChange={setSecondaryConditions}
              canAddMore={conditionCount < 20} />
            }
              <button
              disabled={hasSecondaryGroup}
              onClick={() => setSecondaryConditions([''])}
              className="text-sm text-brand-500 disabled:text-slate-400">
                + 新增條件組 B
              </button>
              <div className={`text-sm ${overLimit ? 'text-red-600' : 'text-slate-600'}`}>
                條件總數：{conditionCount}/20
              </div>
              {overLimit &&
            <div className="text-sm text-red-600">
                  單一分群最多 20 個條件，請刪減後再繼續。
                </div>
            }
            </div>
          }
          {step === 4 &&
          <div className="space-y-4">
              <div className="bg-slate-50 border border-wf-border rounded p-6 text-center">
                {!estimatedCount && !isEstimating &&
              <button onClick={estimate} className="px-6 py-3 bg-brand-500 text-white rounded hover:bg-brand-600 hover:translate-x-1.5 transition-all cursor-pointer">
                    預估人數
                  </button>
              }
                {isEstimating &&
              <p className="text-slate-600">計算中...</p>
              }
                {estimatedCount &&
              <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-3xl font-bold text-slate-900">
                        約 {estimatedCount.toLocaleString()} 人
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">品牌分佈為近似值，可能隨資料更新變化。</p>
                  </div>
              }
              </div>
              {cooldownError &&
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                  {cooldownError}
                </div>
            }
              <div className="text-sm text-slate-500">預估查詢限制：每個分群每分鐘最多 1 次。</div>
            </div>
          }
        </div>
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-slate-700">
            {step === 1 ? '取消' : '上一步'}
          </button>
          <button
            disabled={step === 2 && !name.trim() || step === 3 && (overLimit || conditions.filter(Boolean).length === 0)}
            onClick={() => step < 4 ? setStep(step + 1) : submit()}
            className="px-6 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 hover:translate-x-1.5 transition-all cursor-pointer disabled:opacity-40">
            {step === 4 ? mode === 'create' ? '建立分群' : '儲存變更' : '下一步'}
          </button>
        </div>
      </div>
    </div>);
};

const ExportModal = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  source,
  rowEstimate
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: string[]) => void;
  role: UserRole;
  source: string;
  rowEstimate: number;
}) => {
  const fields = [
  { key: 'cora_id', label: 'cora_id（必選）', required: true },
  { key: 'member_id', label: 'member_id' },
  { key: 'registration_brand', label: 'registration_brand' },
  { key: 'registration_date', label: 'registration_date' },
  { key: 'channel_opt_in.push', label: 'channel_opt_in.push' },
  { key: 'channel_opt_in.line', label: 'channel_opt_in.line' },
  { key: 'email', label: 'email', pii: true },
  { key: 'phone', label: 'phone', pii: true }];
  const [selected, setSelected] = useState<string[]>(['cora_id', 'member_id']);

  useEffect(() => {
    if (isOpen) setSelected(['cora_id', 'member_id']);
  }, [isOpen]);
  if (!isOpen) return null;
  const toggle = (field: string, required?: boolean, pii?: boolean) => {
    if (required) return;
    if (pii && role !== 'system_admin') return;
    setSelected((prev) => prev.includes(field) ? prev.filter((v) => v !== field) : [...prev, field]);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">匯出名單</h2>
            <p className="text-sm text-slate-500 mt-1">來源：{source}（預估 {rowEstimate.toLocaleString()} 筆）</p>
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
          {fields.map((field) =>
          <button
            key={field.key}
            onClick={() => toggle(field.key, field.required, field.pii)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded border text-sm ${selected.includes(field.key) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-wf-border text-slate-700'} ${field.pii && role !== 'system_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>
                {field.label}
                {field.pii && <span className="ml-2 text-amber-600">⚠ PII</span>}
              </span>
              <span>{selected.includes(field.key) ? '已勾選' : '未勾選'}</span>
            </button>
          )}
          {role !== 'system_admin' &&
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Marketer 可看到 PII 欄位但不能勾選。
            </div>
          }
          {rowEstimate > 10000 &&
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              匯出超過 10,000 筆，將觸發黃色告警通知 System Admin。
            </div>
          }
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between">
          <span className="text-xs text-slate-500">CSV UTF-8 with BOM，檔案 72 小時後失效。</span>
          <button
            onClick={() => onSubmit(selected)}
            className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 hover:translate-x-1.5 transition-all cursor-pointer">
            確認匯出
          </button>
        </div>
      </div>
    </div>);
};

const ExploreModal = ({
  isOpen,
  onClose,
  onSaveAsSegment,
  onExport
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsSegment: (payload: SegmentEditorPayload) => void;
  onExport: (source: string, estimate: number) => void;
}) => {
  const [conditions, setConditions] = useState<string[]>(['用戶屬性｜registration_brand｜=｜supertaste']);
  const [groupLogic, setGroupLogic] = useState<GroupLogic>('AND');
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [segmentType, setSegmentType] = useState<SegmentType>('dynamic');
  const [isEstimating, setIsEstimating] = useState(false);
  const [lastEstimateAt, setLastEstimateAt] = useState<number | null>(null);
  const [hint, setHint] = useState('');

  const reset = () => {
    setConditions(['用戶屬性｜registration_brand｜=｜supertaste']);
    setGroupLogic('AND');
    setEstimatedCount(null);
    setName('');
    setSegmentType('dynamic');
    setIsEstimating(false);
    setLastEstimateAt(null);
    setHint('');
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen]);

  if (!isOpen) return null;
  const estimate = () => {
    const current = now();
    if (lastEstimateAt && current - lastEstimateAt < 60000) {
      setHint(`預估頻率限制中，請 ${Math.ceil((60000 - (current - lastEstimateAt)) / 1000)} 秒後再試。`);
      return;
    }
    setHint('');
    setIsEstimating(true);
    setLastEstimateAt(current);
    setTimeout(() => {
      setEstimatedCount(3450 + Math.max(0, 4 - conditions.length) * 500);
      setIsEstimating(false);
    }, 1000);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">探索受眾</h2>
              <p className="text-sm text-slate-500">離開後條件不保留，除非儲存為分群。</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <ConditionEditor
            title="條件組 A"
            logic={groupLogic}
            conditions={conditions}
            onLogicChange={setGroupLogic}
            onConditionsChange={setConditions}
            canAddMore={conditions.length < 20} />
          <div className="bg-slate-50 border border-wf-border rounded p-6 text-center">
            {!estimatedCount && !isEstimating &&
            <button onClick={estimate} className="px-6 py-3 bg-brand-500 text-white rounded hover:bg-brand-600 hover:translate-x-1.5 transition-all cursor-pointer">
                預估
              </button>
            }
            {isEstimating &&
            <p className="text-slate-600">預估中...</p>
            }
            {estimatedCount &&
            <div>
                <p className="text-3xl font-bold text-slate-900">
                  約 {estimatedCount.toLocaleString()} 人
                </p>
                <p className="text-sm text-slate-600 mt-2">品牌分佈：supertaste {estimatedCount.toLocaleString()}（100%）</p>
              </div>
            }
          </div>
          {hint &&
          <p className="text-sm text-amber-700">{hint}</p>
          }
          <div className="grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-wf-border rounded"
              placeholder="儲存為分群名稱" />
            <select
              value={segmentType}
              onChange={(e) => setSegmentType(e.target.value as SegmentType)}
              className="px-3 py-2 border border-wf-border rounded">
              <option value="dynamic">動態分群</option>
              <option value="static">靜態分群</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-slate-700">
            結束
          </button>
          <div className="flex items-center space-x-3">
            <button
              disabled={!estimatedCount}
              onClick={() => estimatedCount && onExport('探索結果', estimatedCount)}
              className="px-4 py-2 border border-wf-border rounded disabled:opacity-40 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>匯出名單</span>
            </button>
            <button
              disabled={!estimatedCount || !name.trim()}
              onClick={() => onSaveAsSegment({
                name: name.trim(),
                description: '由探索模式轉存',
                type: segmentType,
                groupLogic,
                conditions: conditions.filter(Boolean),
                nestedLevel: 1,
                estimatedCount: estimatedCount ?? 0
              })}
              className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 hover:translate-x-1.5 transition-all cursor-pointer disabled:opacity-40">
              儲存為分群
            </button>
          </div>
        </div>
      </div>
    </div>);
};

const SegmentDetailModal = ({
  segment,
  onClose
}: {segment: Segment | null;onClose: () => void;}) => {
  if (!segment) return null;
  const count = countConditions(segment);
  const staleWarning = segment.type === 'static' && segment.ageDays > 60 ?
  '名單已超過 60 天，建議重新建立。' :
  segment.type === 'static' && segment.ageDays > 30 ?
  `此名單已建立 ${segment.ageDays} 天，資料可能已變化。` :
  '';
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{segment.name}</h2>
            <p className="text-sm text-slate-500 mt-1">分群詳情</p>
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <TypeBadge type={segment.type} />
            <StatusBadge status={segment.status} />
            <span className="text-xs text-slate-500">
              最後更新：{formatRelative(segment.updatedAt)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-slate-500 mb-1">目前人數</p>
              <p className="font-semibold text-slate-900">{segment.memberCount.toLocaleString()} 人</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-slate-500 mb-1">條件數 / 巢狀層級</p>
              <p className="font-semibold text-slate-900">{count} 個條件 / {segment.nestedLevel} 層</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-slate-500 mb-1">建立者</p>
              <p className="font-semibold text-slate-900">{segment.createdBy}</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-slate-500 mb-1">下游引用</p>
              <p className="font-semibold text-slate-900">{segment.referencedBy} 個任務</p>
            </div>
          </div>
          {staleWarning &&
          <div className="text-sm rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              {staleWarning}
            </div>
          }
          {segment.status === 'paused' &&
          <div className="text-sm rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
              此動態分群已暫停，恢復後成員數可能大幅變動。
            </div>
          }
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">篩選條件</p>
            <div className="space-y-2 text-sm">
              {segment.conditions.map((condition, idx) =>
              <div key={idx} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {condition}
                </div>
              )}
              {segment.secondaryConditions && segment.secondaryConditions.length > 0 &&
              <>
                  <div className="text-xs text-slate-500 py-1">{segment.relationToNextGroup}</div>
                  {segment.secondaryConditions.map((condition, idx) =>
                <div key={`b-${idx}`} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      {condition}
                    </div>
                )}
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);
};

const SegmentCard = ({
  segment,
  onAction
}: {segment: Segment;onAction: (action: string, segment: Segment) => void;}) => {
  const [showMenu, setShowMenu] = useState(false);
  const conditionsCount = countConditions(segment);
  return (
    <div className="card-interactive p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{segment.name}</h3>
            <TypeBadge type={segment.type} />
            <StatusBadge status={segment.status} />
          </div>
          {segment.description &&
          <p className="text-sm text-slate-500 mb-2">{segment.description}</p>
          }
          {segment.referencedBy > 0 &&
          <p className="text-xs text-amber-700">被 {segment.referencedBy} 個下游任務引用中</p>
          }
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu((v) => !v)} className="p-1 hover:bg-slate-100 rounded">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
          {showMenu &&
          <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
                {[
                { key: 'view', label: '檢視詳情', icon: Eye },
                { key: 'edit', label: '編輯條件', icon: Edit },
                { key: 'export', label: '匯出名單', icon: Download },
                { key: 'copy', label: '複製分群', icon: Copy }].
                map((item) =>
                <button
                  key={item.key}
                  onClick={() => {
                    onAction(item.key, segment);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )}
                {segment.type === 'dynamic' && segment.status === 'active' &&
              <button
                onClick={() => {
                  onAction('pause', segment);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                  <Pause className="w-4 h-4" />
                  <span>暫停更新</span>
                </button>
              }
                {segment.status === 'paused' &&
              <button
                onClick={() => {
                  onAction('resume', segment);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>恢復更新</span>
                </button>
              }
                <button
                onClick={() => {
                  onAction('archive', segment);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 border-t border-slate-100">
                  <Archive className="w-4 h-4" />
                  <span>封存</span>
                </button>
              </div>
            </>
          }
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
            <Users className="w-3 h-3" />
            <span>目前人數</span>
          </div>
          <div className="text-lg font-semibold text-slate-900">{segment.memberCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
            <Filter className="w-3 h-3" />
            <span>條件數</span>
          </div>
          <div className="text-lg font-semibold text-slate-900">{conditionsCount}</div>
        </div>
        <div>
          <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>最後更新</span>
          </div>
          <div className="text-sm text-slate-600">{formatRelative(segment.updatedAt)}</div>
        </div>
      </div>
    </div>);
};

export default function Audience() {
  const [segments, setSegments] = useState<Segment[]>(defaultSegments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SegmentStatus | 'all'>('all');
  const [role, setRole] = useState<UserRole>('marketer');
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingSegment, setEditingSegment] = useState<Segment | undefined>(undefined);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [exportTarget, setExportTarget] = useState<{source: string;estimate: number;} | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const currentUserName = '目前登入者';

  const filteredSegments = useMemo(() => {
    return [...segments].
    sort((a, b) => b.updatedAt - a.updatedAt).
    filter((segment) => {
      const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || segment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, segments, statusFilter]);

  const upsertSegment = (payload: SegmentEditorPayload) => {
    if (editorMode === 'create' || !editingSegment) {
      const created: Segment = {
        id: crypto.randomUUID(),
        name: payload.name,
        description: payload.description,
        type: payload.type,
        status: 'active',
        memberCount: payload.estimatedCount,
        updatedAt: now(),
        createdBy: currentUserName,
        conditions: payload.conditions,
        groupLogic: payload.groupLogic,
        relationToNextGroup: payload.relationToNextGroup,
        secondaryConditions: payload.secondaryConditions,
        secondaryGroupLogic: payload.secondaryGroupLogic,
        nestedLevel: payload.nestedLevel,
        referencedBy: 0,
        ageDays: 0
      };
      setSegments((prev) => [created, ...prev]);
      setSelectedSegment(created);
      return;
    }
    setSegments((prev) => prev.map((item) => item.id === editingSegment.id ? {
      ...item,
      name: payload.name,
      description: payload.description,
      conditions: payload.conditions,
      groupLogic: payload.groupLogic,
      relationToNextGroup: payload.relationToNextGroup,
      secondaryConditions: payload.secondaryConditions,
      secondaryGroupLogic: payload.secondaryGroupLogic,
      nestedLevel: payload.nestedLevel,
      memberCount: payload.estimatedCount,
      updatedAt: now()
    } : item));
  };

  const handleAction = (action: string, segment: Segment) => {
    if (action === 'view') {
      setSelectedSegment(segment);
      return;
    }
    if (action === 'edit') {
      if (segment.type === 'static') {
        alert('靜態分群建立後不可直接編輯，請使用「複製分群」後重建。');
        return;
      }
      setEditorMode('edit');
      setEditingSegment(segment);
      setShowEditor(true);
      return;
    }
    if (action === 'export') {
      if (segment.status !== 'active') {
        alert('只有「啟用中」分群可匯出名單。');
        return;
      }
      setExportTarget({ source: segment.name, estimate: segment.memberCount });
      return;
    }
    if (action === 'copy') {
      const copied: Segment = {
        ...segment,
        id: crypto.randomUUID(),
        name: `${segment.name}（複本）`,
        status: 'draft',
        createdBy: currentUserName,
        updatedAt: now(),
        referencedBy: 0
      };
      setSegments((prev) => [copied, ...prev]);
      return;
    }
    if (action === 'pause') {
      if (segment.referencedBy > 0) {
        alert(`此分群被 ${segment.referencedBy} 個下游任務引用，需先解除引用才能暫停。`);
        return;
      }
      setSegments((prev) => prev.map((item) => item.id === segment.id ? { ...item, status: 'paused', updatedAt: now() } : item));
      return;
    }
    if (action === 'resume') {
      setSegments((prev) => prev.map((item) => item.id === segment.id ? { ...item, status: 'active', updatedAt: now() } : item));
      alert('恢復後成員可能大幅變動，系統將在下次重算更新名單。');
      return;
    }
    if (action === 'archive') {
      if (segment.referencedBy > 0) {
        alert(`此分群被 ${segment.referencedBy} 個下游任務引用，需先解除引用才能封存。`);
        return;
      }
      setSegments((prev) => prev.map((item) => item.id === segment.id ? { ...item, status: 'archived', updatedAt: now() } : item));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">受眾區隔</h1>
        <p className="text-slate-500">符合 PRD-004 的前端流程驗證版本</p>
      </div>

      <div className="bg-white rounded-xl border border-wf-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditorMode('create');
                setEditingSegment(undefined);
                setShowEditor(true);
              }}
              className="px-4 py-2 btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>建立分群</span>
            </button>
            <button
              onClick={() => setShowExploreModal(true)}
              className="px-4 py-2 border border-brand-500 text-brand-500 rounded hover:bg-brand-50 hover:translate-x-1.5 transition-all duration-200 cursor-pointer font-medium flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>探索受眾</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="px-3 py-2 border border-wf-border rounded text-sm">
              <option value="marketer">角色：Marketer</option>
              <option value="system_admin">角色：System Admin</option>
            </select>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋分群名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-wf-border rounded text-sm w-64" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SegmentStatus | 'all')}
              className="px-3 py-2 border border-wf-border rounded text-sm">
              <option value="all">全部狀態</option>
              <option value="active">啟用中</option>
              <option value="draft">草稿</option>
              <option value="paused">已暫停</option>
              <option value="archived">已封存</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSegments.map((segment) =>
          <SegmentCard key={segment.id} segment={segment} onAction={handleAction} />
          )}
        </div>

        {filteredSegments.length === 0 &&
        <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">找不到符合條件的分群</p>
          </div>
        }
      </div>

      {exportJobs.length > 0 &&
      <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-900 mb-3">通知中心（匯出結果）</p>
          <div className="space-y-2">
            {exportJobs.map((job) =>
          <div key={job.id} className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                <span>
                  📥 {job.source}_{new Date(job.createdAt).toISOString().slice(0, 19).replaceAll(':', '')}.csv ｜ {job.rowCount.toLocaleString()} 筆
                </span>
                <span className="text-xs text-slate-500">
                  有效至：{new Date(job.expiresAt).toLocaleString()}
                </span>
              </div>
          )}
          </div>
        </div>
      }

      <SegmentEditorModal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSubmit={upsertSegment}
        mode={editorMode}
        initialSegment={editingSegment} />

      <ExploreModal
        isOpen={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        onSaveAsSegment={(payload) => {
          upsertSegment(payload);
          setShowExploreModal(false);
        }}
        onExport={(source, estimate) => setExportTarget({ source, estimate })} />

      <SegmentDetailModal
        segment={selectedSegment}
        onClose={() => setSelectedSegment(null)} />

      <ExportModal
        isOpen={Boolean(exportTarget)}
        onClose={() => setExportTarget(null)}
        role={role}
        source={exportTarget?.source ?? '分群'}
        rowEstimate={exportTarget?.estimate ?? 0}
        onSubmit={(fields) => {
          if (!exportTarget) return;
          const job: ExportJob = {
            id: crypto.randomUUID(),
            source: exportTarget.source,
            rowCount: exportTarget.estimate,
            fields,
            includePII: fields.includes('email') || fields.includes('phone'),
            createdAt: now(),
            expiresAt: now() + 72 * 60 * 60 * 1000
          };
          setExportJobs((prev) => [job, ...prev]);
          if (job.rowCount > 10000) {
            alert('已觸發黃色告警：大量名單匯出（>10,000 筆）。');
          }
          setExportTarget(null);
          alert('匯出作業已建立，完成後可在通知中心下載。');
        }} />
    </div>);
}