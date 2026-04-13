// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: GDPR tab — request management list with status badges

import React, { useState } from 'react';
import { CheckCircle2, Database, FileText, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type GdprStatus =
  | 'pending_approval'
  | 'queued'
  | 'in_progress'
  | 'partially_completed'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface GdprRequest {
  id: string;
  type: 'export_request' | 'deletion_request';
  coraId: string;
  requester: string;
  approver?: string;
  status: GdprStatus;
  reason: string;
}

const initialGdpr: GdprRequest[] = [
  {
    id: 'g1',
    type: 'export_request',
    coraId: '550e8400-e29b-41d4-a716',
    requester: 'Amber Chang',
    status: 'completed',
    reason: 'DSAR #2026-041',
  },
  {
    id: 'g2',
    type: 'deletion_request',
    coraId: '4fe1e12f-7f52-4f2b-a3bf',
    requester: 'Amber Chang',
    approver: 'Jack Hsu',
    status: 'in_progress',
    reason: 'DSAR #2026-042',
  },
];

function StatusBadge({ status }: { status: GdprStatus }) {
  const styles: Partial<Record<GdprStatus, string>> = {
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const cls = styles[status] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function GdprTab() {
  const [gdprRequests] = useState<GdprRequest[]>(initialGdpr);

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        GDPR Request Orchestrator
      </h3>

      <div className="overflow-x-auto mb-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>cora_id</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gdprRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs text-ph-secondary">{req.id}</TableCell>
                <TableCell className="text-sm text-ph-text">{req.type}</TableCell>
                <TableCell className="font-mono text-xs text-ph-secondary">{req.coraId}</TableCell>
                <TableCell className="text-ph-text">{req.requester}</TableCell>
                <TableCell className="text-ph-secondary">{req.approver ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-ph-secondary text-sm">{req.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="border border-border rounded-md p-3 bg-ph-surface">
          <Database className="w-4 h-4 mb-1 text-ph-secondary" />
          <p className="text-ph-secondary">
            module_tasks：Identity / Data / Audience / Delivery / Engagement
          </p>
        </div>
        <div className="border border-border rounded-md p-3 bg-ph-surface">
          <CheckCircle2 className="w-4 h-4 mb-1 text-ph-secondary" />
          <p className="text-ph-secondary">
            刪除需第二位 System Admin 覆核後才可入列
          </p>
        </div>
        <div className="border border-border rounded-md p-3 bg-ph-surface">
          <FileText className="w-4 h-4 mb-1 text-ph-secondary" />
          <p className="text-ph-secondary">
            audit log 不可寫入明文 PII（僅遮罩或摘要）
          </p>
        </div>
      </div>
    </div>
  );
}
