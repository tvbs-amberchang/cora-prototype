// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Audit tab — audit log table with search

import React, { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  module: string;
  ip: string;
}

const initialLogs: AuditLog[] = [
  { id: 'l1', at: '2026-04-08 09:12', actor: 'Amber Chang (System Admin)', action: 'channel.update', target: 'SMS provider priority', module: 'system_admin', ip: '10.2.1.32' },
  { id: 'l2', at: '2026-04-08 09:00', actor: 'Joan Lin (Marketer)', action: 'campaign.send', target: '母親節 LINE 群發', module: 'delivery', ip: '10.2.1.88' },
  { id: 'l3', at: '2026-04-07 18:22', actor: 'Amber Chang (System Admin)', action: 'rbac.update', target: 'Mina Wu brand assignment', module: 'system_admin', ip: '10.2.1.32' },
];

export default function AuditTab() {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [logQuery, setLogQuery] = useState('');

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        [log.actor, log.action, log.target, log.module]
          .join(' ')
          .toLowerCase()
          .includes(logQuery.toLowerCase())
      ),
    [logQuery, logs]
  );

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        全域稽核日誌（append-only）
      </h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={logQuery}
          onChange={(e) => setLogQuery(e.target.value)}
          placeholder="搜尋操作者 / 動作 / 目標..."
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>時間</TableHead>
              <TableHead>操作者</TableHead>
              <TableHead>動作</TableHead>
              <TableHead>目標</TableHead>
              <TableHead>模組</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-ph-muted py-8">
                  無符合條件的日誌
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-ph-secondary whitespace-nowrap">{log.at}</TableCell>
                  <TableCell className="text-ph-text">{log.actor}</TableCell>
                  <TableCell className="font-mono text-xs text-ph-secondary">{log.action}</TableCell>
                  <TableCell className="text-ph-text">{log.target}</TableCell>
                  <TableCell className="text-xs text-ph-secondary">{log.module}</TableCell>
                  <TableCell className="text-xs font-mono text-ph-secondary">{log.ip}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
