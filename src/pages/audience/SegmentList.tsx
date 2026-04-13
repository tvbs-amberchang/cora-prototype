// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Segment management table with search/filter and per-row action menu

import React, { useState } from 'react';
import {
  Archive,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  now,
  type GroupLogic,
  type Segment,
  type SegmentEditorPayload,
  type SegmentStatus,
  type SegmentType,
  countConditions,
  formatRelative,
} from './types';

// --- Badge helpers ---

const statusVariant: Record<SegmentStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  paused: 'outline',
  archived: 'secondary',
};

const statusLabel: Record<SegmentStatus, string> = {
  draft: '草稿',
  active: '啟用中',
  paused: '已暫停',
  archived: '已封存',
};

const typeLabel: Record<SegmentType, string> = {
  dynamic: '動態',
  static: '靜態',
};

const StatusBadge = ({ status }: { status: SegmentStatus }) => (
  <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
);

const TypeBadge = ({ type }: { type: SegmentType }) => (
  <Badge variant="outline">{typeLabel[type]}</Badge>
);

// --- Segment card row ---

interface SegmentCardProps {
  segment: Segment;
  onAction: (action: string, segment: Segment) => void;
}

const SegmentCard = ({ segment, onAction }: SegmentCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const conditionsCount = countConditions(segment);

  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-base font-semibold text-ph-text">{segment.name}</h3>
            <TypeBadge type={segment.type} />
            <StatusBadge status={segment.status} />
          </div>
          {segment.description && (
            <p className="text-sm text-ph-secondary mb-2">{segment.description}</p>
          )}
          {segment.referencedBy > 0 && (
            <p className="text-xs text-amber-700">被 {segment.referencedBy} 個下游任務引用中</p>
          )}
        </div>

        {/* Action menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu((v) => !v)}
            className="p-1 h-auto"
          >
            <MoreVertical className="w-4 h-4 text-ph-muted" />
          </Button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-border rounded-lg shadow-lg py-1 z-20">
                {[
                  { key: 'view', label: '檢視詳情', icon: Eye },
                  { key: 'edit', label: '編輯條件', icon: Edit },
                  { key: 'export', label: '匯出名單', icon: Download },
                  { key: 'copy', label: '複製分群', icon: Copy },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onAction(item.key, segment);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-ph-text hover:bg-ph-surface flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}

                {segment.type === 'dynamic' && segment.status === 'active' && (
                  <button
                    onClick={() => {
                      onAction('pause', segment);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-ph-text hover:bg-ph-surface flex items-center space-x-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>暫停更新</span>
                  </button>
                )}

                {segment.status === 'paused' && (
                  <button
                    onClick={() => {
                      onAction('resume', segment);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-ph-text hover:bg-ph-surface flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>恢復更新</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onAction('archive', segment);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-ph-text hover:bg-ph-surface flex items-center space-x-2 border-t border-border"
                >
                  <Archive className="w-4 h-4" />
                  <span>封存</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
        <div>
          <div className="flex items-center space-x-1 text-ph-secondary text-xs mb-1">
            <Users className="w-3 h-3" />
            <span>目前人數</span>
          </div>
          <div className="text-base font-semibold text-ph-text">
            {segment.memberCount.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-1 text-ph-secondary text-xs mb-1">
            <Filter className="w-3 h-3" />
            <span>條件數</span>
          </div>
          <div className="text-base font-semibold text-ph-text">{conditionsCount}</div>
        </div>
        <div>
          <div className="flex items-center space-x-1 text-ph-secondary text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>最後更新</span>
          </div>
          <div className="text-sm text-ph-secondary">{formatRelative(segment.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
};

// --- Segment detail modal ---

interface SegmentDetailModalProps {
  segment: Segment | null;
  onClose: () => void;
}

export const SegmentDetailModal = ({ segment, onClose }: SegmentDetailModalProps) => {
  if (!segment) return null;

  const count = countConditions(segment);
  const staleWarning =
    segment.type === 'static' && segment.ageDays > 60
      ? '名單已超過 60 天，建議重新建立。'
      : segment.type === 'static' && segment.ageDays > 30
      ? `此名單已建立 ${segment.ageDays} 天，資料可能已變化。`
      : '';

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ph-text">{segment.name}</h2>
            <p className="text-sm text-ph-secondary mt-1">分群詳情</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-ph-muted">
            <Users className="w-5 h-5 hidden" />
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <TypeBadge type={segment.type} />
            <StatusBadge status={segment.status} />
            <span className="text-xs text-ph-secondary">
              最後更新：{formatRelative(segment.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: '目前人數', value: `${segment.memberCount.toLocaleString()} 人` },
              {
                label: '條件數 / 巢狀層級',
                value: `${count} 個條件 / ${segment.nestedLevel} 層`,
              },
              { label: '建立者', value: segment.createdBy },
              { label: '下游引用', value: `${segment.referencedBy} 個任務` },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border rounded-lg p-4 bg-ph-surface">
                <p className="text-ph-secondary mb-1">{label}</p>
                <p className="font-semibold text-ph-text">{value}</p>
              </div>
            ))}
          </div>

          {staleWarning && (
            <div className="text-sm rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              {staleWarning}
            </div>
          )}

          {segment.status === 'paused' && (
            <div className="text-sm rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
              此動態分群已暫停，恢復後成員數可能大幅變動。
            </div>
          )}

          <div className="border border-border rounded-lg p-4">
            <p className="font-medium text-ph-text mb-3">篩選條件</p>
            <div className="space-y-2 text-sm">
              {segment.conditions.map((condition, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-ph-surface border border-border rounded-lg text-ph-text"
                >
                  {condition}
                </div>
              ))}
              {segment.secondaryConditions && segment.secondaryConditions.length > 0 && (
                <>
                  <div className="text-xs text-ph-secondary py-1">
                    {segment.relationToNextGroup}
                  </div>
                  {segment.secondaryConditions.map((condition, idx) => (
                    <div
                      key={`b-${idx}`}
                      className="px-3 py-2 bg-ph-surface border border-border rounded-lg text-ph-text"
                    >
                      {condition}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Export modal ---

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: string[]) => void;
  role: 'system_admin' | 'marketer';
  source: string;
  rowEstimate: number;
}

export const ExportModal = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  source,
  rowEstimate,
}: ExportModalProps) => {
  const fields = [
    { key: 'cora_id', label: 'cora_id（必選）', required: true },
    { key: 'member_id', label: 'member_id' },
    { key: 'registration_brand', label: 'registration_brand' },
    { key: 'registration_date', label: 'registration_date' },
    { key: 'channel_opt_in.push', label: 'channel_opt_in.push' },
    { key: 'channel_opt_in.line', label: 'channel_opt_in.line' },
    { key: 'email', label: 'email', pii: true },
    { key: 'phone', label: 'phone', pii: true },
  ];
  const [selected, setSelected] = useState<string[]>(['cora_id', 'member_id']);

  React.useEffect(() => {
    if (isOpen) setSelected(['cora_id', 'member_id']);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (field: string, required?: boolean, pii?: boolean) => {
    if (required) return;
    if (pii && role !== 'system_admin') return;
    setSelected((prev) =>
      prev.includes(field) ? prev.filter((v) => v !== field) : [...prev, field]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ph-text">匯出名單</h2>
            <p className="text-sm text-ph-secondary mt-1">
              來源：{source}（預估 {rowEstimate.toLocaleString()} 筆）
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-ph-muted">
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
          {fields.map((field) => (
            <button
              key={field.key}
              onClick={() => toggle(field.key, field.required, field.pii)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                selected.includes(field.key)
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-border text-ph-text'
              } ${field.pii && role !== 'system_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>
                {field.label}
                {field.pii && <span className="ml-2 text-amber-600">⚠ PII</span>}
              </span>
              <span>{selected.includes(field.key) ? '已勾選' : '未勾選'}</span>
            </button>
          ))}

          {role !== 'system_admin' && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Marketer 可看到 PII 欄位但不能勾選。
            </div>
          )}

          {rowEstimate > 10000 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              匯出超過 10,000 筆，將觸發黃色告警通知 System Admin。
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-ph-surface flex justify-between items-center">
          <span className="text-xs text-ph-secondary">CSV UTF-8 with BOM，檔案 72 小時後失效。</span>
          <Button onClick={() => onSubmit(selected)}>確認匯出</Button>
        </div>
      </div>
    </div>
  );
};

// --- Explore modal ---

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsSegment: (payload: SegmentEditorPayload) => void;
  onExport: (source: string, estimate: number) => void;
}

export const ExploreModal = ({
  isOpen,
  onClose,
  onSaveAsSegment,
  onExport,
}: ExploreModalProps) => {
  const [conditions, setConditions] = useState<string[]>([
    '用戶屬性｜registration_brand｜=｜supertaste',
  ]);
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

  React.useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen]);

  if (!isOpen) return null;

  const estimate = () => {
    const current = now();
    if (lastEstimateAt && current - lastEstimateAt < 60000) {
      setHint(
        `預估頻率限制中，請 ${Math.ceil((60000 - (current - lastEstimateAt)) / 1000)} 秒後再試。`
      );
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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ph-text">探索受眾</h2>
            <p className="text-sm text-ph-secondary">離開後條件不保留，除非儲存為分群。</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-ph-muted">
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="border border-border rounded-lg p-4 bg-ph-surface space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-ph-text">條件組 A</span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-ph-secondary">群組邏輯</span>
                <select
                  value={groupLogic}
                  onChange={(e) => setGroupLogic(e.target.value as GroupLogic)}
                  className="px-2 py-1 border border-border rounded bg-white text-ph-text text-xs"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            </div>
            {conditions.map((condition, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  value={condition}
                  onChange={(e) => {
                    const copied = [...conditions];
                    copied[idx] = e.target.value;
                    setConditions(copied);
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded bg-white text-ph-text"
                  placeholder="例如：行為｜page_view｜≥ 3 次｜近 7 天"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}
                  className="text-red-600 border-red-200 hover:bg-red-50 px-2"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={conditions.length >= 20}
              onClick={() => setConditions([...conditions, ''])}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-ph-muted px-0"
            >
              + 新增條件
            </Button>
          </div>

          <div className="bg-ph-surface border border-border rounded-lg p-6 text-center">
            {!estimatedCount && !isEstimating && (
              <Button onClick={estimate}>預估</Button>
            )}
            {isEstimating && <p className="text-ph-secondary">預估中...</p>}
            {estimatedCount && (
              <div>
                <p className="text-3xl font-bold text-ph-text">
                  約 {estimatedCount.toLocaleString()} 人
                </p>
                <p className="text-sm text-ph-secondary mt-2">
                  品牌分佈：supertaste {estimatedCount.toLocaleString()}（100%）
                </p>
              </div>
            )}
          </div>

          {hint && <p className="text-sm text-amber-700">{hint}</p>}

          <div className="grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm text-ph-text"
              placeholder="儲存為分群名稱"
            />
            <select
              value={segmentType}
              onChange={(e) => setSegmentType(e.target.value as SegmentType)}
              className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white"
            >
              <option value="dynamic">動態分群</option>
              <option value="static">靜態分群</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-ph-surface flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            結束
          </Button>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              disabled={!estimatedCount}
              onClick={() => estimatedCount && onExport('探索結果', estimatedCount)}
            >
              <Download className="w-4 h-4 mr-2" />
              匯出名單
            </Button>
            <Button
              disabled={!estimatedCount || !name.trim()}
              onClick={() =>
                onSaveAsSegment({
                  name: name.trim(),
                  description: '由探索模式轉存',
                  type: segmentType,
                  groupLogic,
                  conditions: conditions.filter(Boolean),
                  nestedLevel: 1,
                  estimatedCount: estimatedCount ?? 0,
                })
              }
            >
              儲存為分群
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main SegmentList export ---

interface SegmentListProps {
  segments: Segment[];
  searchQuery: string;
  statusFilter: SegmentStatus | 'all';
  onAction: (action: string, segment: Segment) => void;
}

export const SegmentList = ({
  segments,
  searchQuery,
  statusFilter,
  onAction,
}: SegmentListProps) => {
  const filtered = [...segments]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-ph-muted mx-auto mb-3" />
        <p className="text-ph-secondary">找不到符合條件的分群</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filtered.map((segment) => (
        <SegmentCard key={segment.id} segment={segment} onAction={onAction} />
      ))}
    </div>
  );
};
