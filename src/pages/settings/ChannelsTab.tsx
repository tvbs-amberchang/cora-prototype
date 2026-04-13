// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Channels tab — credential cards with health status badges

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Channel = 'push' | 'line' | 'sms' | 'email';
type HealthStatus = 'healthy' | 'error' | 'unset';

interface ChannelCredential {
  id: string;
  channel: Channel;
  provider: string;
  maskedKey: string;
  status: HealthStatus;
  lastCheck: string;
  isPrimary?: boolean;
}

const channelLabel: Record<Channel, string> = {
  push: 'App Push',
  line: 'LINE OA',
  sms: 'SMS',
  email: 'Email',
};

const initialCredentials: ChannelCredential[] = [
  { id: 'c1', channel: 'push', provider: 'APNs', maskedKey: 'apns_****7a3b', status: 'healthy', lastCheck: '剛剛' },
  { id: 'c2', channel: 'push', provider: 'FCM', maskedKey: 'fcm_****1ee9', status: 'healthy', lastCheck: '剛剛' },
  { id: 'c3', channel: 'line', provider: 'LINE Messaging API', maskedKey: 'line_****22fe', status: 'healthy', lastCheck: '1 分鐘前' },
  { id: 'c4', channel: 'sms', provider: 'Mitake', maskedKey: 'mitake_****991a', status: 'error', lastCheck: '2 分鐘前', isPrimary: true },
  { id: 'c5', channel: 'sms', provider: 'Infobip', maskedKey: 'infobip_****38cc', status: 'healthy', lastCheck: '2 分鐘前' },
  { id: 'c6', channel: 'email', provider: 'ESP Provider', maskedKey: 'esp_****0c5d', status: 'unset', lastCheck: '-' },
];

function HealthBadge({ status }: { status: HealthStatus }) {
  const styles: Record<HealthStatus, string> = {
    healthy: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    unset: 'bg-gray-100 text-gray-500',
  };
  const labels: Record<HealthStatus, string> = {
    healthy: '正常',
    error: '異常',
    unset: '未設定',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function ChannelsTab() {
  const [credentials] = useState<ChannelCredential[]>(initialCredentials);

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
        <KeyRound className="w-4 h-4" />
        渠道憑證與健康狀態
      </h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>憑證</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>最後檢查</TableHead>
              <TableHead>備註</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-ph-text">{channelLabel[item.channel]}</TableCell>
                <TableCell className="text-ph-text">{item.provider}</TableCell>
                <TableCell className="font-mono text-xs text-ph-secondary">{item.maskedKey}</TableCell>
                <TableCell>
                  <HealthBadge status={item.status} />
                </TableCell>
                <TableCell className="text-ph-secondary text-sm">{item.lastCheck}</TableCell>
                <TableCell className="text-xs text-ph-muted">
                  {item.channel === 'sms' && item.isPrimary ? '主要供應商' : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-xs text-ph-secondary bg-ph-surface border border-border rounded-md p-3">
        憑證寫入後僅顯示遮罩；SMS 供應商失敗時可切到備援，恢復後自動切回主要。
      </div>
    </div>
  );
}
