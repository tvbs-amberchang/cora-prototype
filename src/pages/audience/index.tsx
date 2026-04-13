// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Audience page — composes SegmentList + SegmentEditor + modals

import React, { useMemo, useState } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentList, SegmentDetailModal, ExportModal, ExploreModal } from './SegmentList';
import { SegmentEditor } from './SegmentEditor';
import {
  type ExportJob,
  type Segment,
  type SegmentEditorPayload,
  type SegmentStatus,
  type UserRole,
  defaultSegments,
  now,
} from './types';

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
  const [exportTarget, setExportTarget] = useState<{ source: string; estimate: number } | null>(
    null
  );
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);

  const currentUserName = '目前登入者';

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
        ageDays: 0,
      };
      setSegments((prev) => [created, ...prev]);
      setSelectedSegment(created);
      return;
    }
    setSegments((prev) =>
      prev.map((item) =>
        item.id === editingSegment.id
          ? {
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
              updatedAt: now(),
            }
          : item
      )
    );
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
        referencedBy: 0,
      };
      setSegments((prev) => [copied, ...prev]);
      return;
    }
    if (action === 'pause') {
      if (segment.referencedBy > 0) {
        alert(`此分群被 ${segment.referencedBy} 個下游任務引用，需先解除引用才能暫停。`);
        return;
      }
      setSegments((prev) =>
        prev.map((item) =>
          item.id === segment.id ? { ...item, status: 'paused', updatedAt: now() } : item
        )
      );
      return;
    }
    if (action === 'resume') {
      setSegments((prev) =>
        prev.map((item) =>
          item.id === segment.id ? { ...item, status: 'active', updatedAt: now() } : item
        )
      );
      alert('恢復後成員可能大幅變動，系統將在下次重算更新名單。');
      return;
    }
    if (action === 'archive') {
      if (segment.referencedBy > 0) {
        alert(`此分群被 ${segment.referencedBy} 個下游任務引用，需先解除引用才能封存。`);
        return;
      }
      setSegments((prev) =>
        prev.map((item) =>
          item.id === segment.id ? { ...item, status: 'archived', updatedAt: now() } : item
        )
      );
    }
  };

  return (
    <div className="p-6 md:p-8 ">
      <PageHeader title="受眾區隔" description="符合 PRD-004 的前端流程驗證版本" />

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                setEditorMode('create');
                setEditingSegment(undefined);
                setShowEditor(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              建立分群
            </Button>
            <Button variant="outline" onClick={() => setShowExploreModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              探索受眾
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white"
            >
              <option value="marketer">角色：Marketer</option>
              <option value="system_admin">角色：System Admin</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="搜尋分群名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SegmentStatus | 'all')}
              className="px-3 py-2 border border-border rounded-md text-sm text-ph-text bg-white"
            >
              <option value="all">全部狀態</option>
              <option value="active">啟用中</option>
              <option value="draft">草稿</option>
              <option value="paused">已暫停</option>
              <option value="archived">已封存</option>
            </select>
          </div>
        </div>

        <SegmentList
          segments={segments}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onAction={handleAction}
        />
      </div>

      {/* Export jobs notification */}
      {exportJobs.length > 0 && (
        <div className="mb-6 bg-white border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-ph-text mb-3">通知中心（匯出結果）</p>
          <div className="space-y-2">
            {exportJobs.map((job) => (
              <div
                key={job.id}
                className="border border-border rounded-lg px-3 py-2 text-sm flex items-center justify-between"
              >
                <span>
                  {job.source}_{new Date(job.createdAt).toISOString().slice(0, 19).replaceAll(':', '')}.csv ｜{' '}
                  {job.rowCount.toLocaleString()} 筆
                </span>
                <span className="text-xs text-ph-secondary">
                  有效至：{new Date(job.expiresAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SegmentEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSubmit={upsertSegment}
        mode={editorMode}
        initialSegment={editingSegment}
      />

      <ExploreModal
        isOpen={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        onSaveAsSegment={(payload) => {
          upsertSegment(payload);
          setShowExploreModal(false);
        }}
        onExport={(source, estimate) => setExportTarget({ source, estimate })}
      />

      <SegmentDetailModal segment={selectedSegment} onClose={() => setSelectedSegment(null)} />

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
            expiresAt: now() + 72 * 60 * 60 * 1000,
          };
          setExportJobs((prev) => [job, ...prev]);
          if (job.rowCount > 10000) {
            alert('已觸發黃色告警：大量名單匯出（>10,000 筆）。');
          }
          setExportTarget(null);
          alert('匯出作業已建立，完成後可在通知中心下載。');
        }}
      />
    </div>
  );
}
