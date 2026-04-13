// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Delivery task list table with filters and report dialog

import React, { useMemo, useState } from 'react';
import { BarChart3, Copy, Mail, MessageCircle, MessageSquare, Search, Send, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ChannelType, TaskStatus, SendTask } from './types';
import {
  channelLabel,
  channelUnitCost,
  statusLabel,
} from './types';

// ---- Channel icon helper ----
const ChannelIcon = ({ channel }: { channel: ChannelType }) =>
  channel === 'push' ? <Smartphone className="w-4 h-4 text-blue-500" /> :
  channel === 'line' ? <MessageCircle className="w-4 h-4 text-green-600" /> :
  channel === 'sms' ? <MessageSquare className="w-4 h-4 text-orange-600" /> :
  <Mail className="w-4 h-4 text-purple-600" />;

// ---- Status badge variant mapping ----
function statusVariant(status: TaskStatus): 'secondary' | 'default' | 'destructive' | 'outline' {
  switch (status) {
    case 'draft':      return 'secondary';
    case 'scheduled':  return 'secondary';
    case 'sending':    return 'default';
    case 'completed':  return 'default';
    case 'failed':     return 'destructive';
  }
}

// ---- Report dialog ----
function ReportDialog({ task, onClose }: { task: SendTask; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 z-50 p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl shadow-2xl max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ph-text">{task.name} 發送報表</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>關閉</Button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '目標人數', value: task.metrics.target.toLocaleString() },
              { label: '可觸達', value: task.metrics.reachable.toLocaleString() },
              { label: '跳過人數', value: task.metrics.skipped.toLocaleString() },
              { label: '已送出', value: task.metrics.sent.toLocaleString() },
              { label: '已送達', value: task.metrics.delivered.toLocaleString() },
              { label: '失敗', value: task.metrics.failed.toLocaleString(), red: true },
            ].map(({ label, value, red }) => (
              <div key={label} className="border border-border rounded-lg p-3">
                <div className="text-ph-secondary text-xs mb-1">{label}</div>
                <div className={`font-semibold font-mono ${red ? 'text-destructive' : 'text-ph-text'}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-3">
            <div className="font-semibold text-ph-text mb-2">跳過原因分佈</div>
            <div className="space-y-1 text-xs text-ph-secondary">
              {Object.entries(task.metrics.skippedReasons).map(([reason, count]) => (
                <div key={reason} className="flex justify-between">
                  <span>{reason}</span>
                  <span className="font-mono">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3">
              <div className="font-semibold text-ph-text mb-2">互動指標</div>
              <div className="text-xs text-ph-secondary space-y-1">
                {[
                  { label: '開啟數', value: task.metrics.opens ?? 0 },
                  { label: '點擊數', value: task.metrics.clicks ?? 0 },
                  { label: '退訂數', value: task.metrics.unsubscribes ?? 0 },
                  { label: '退信數', value: task.metrics.bounces ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span>{label}</span>
                    <span className="font-mono">{value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="font-semibold text-ph-text mb-2">費用摘要</div>
              <div className="text-xs text-ph-secondary space-y-1">
                <div className="flex justify-between">
                  <span>預估費用</span>
                  <span className="font-mono">${Math.round(task.metrics.estimatedCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>實際費用</span>
                  <span className="font-mono">${Math.round(task.metrics.actualCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>渠道單價</span>
                  <span className="font-mono">${channelUnitCost[task.channel]}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-ph-muted flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            事件回寫：`message_sent` / `message_delivered` / `message_failed`，以及渠道互動事件（`notification_click`、`email_open`、`email_click`、`email_unsubscribe`）。
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- TaskList props ----
interface TaskListProps {
  tasks: SendTask[];
  onCreateNew: () => void;
  onDuplicate: (task: SendTask) => void;
}

export function TaskList({ tasks, onCreateNew, onDuplicate }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelType | 'all'>('all');
  const [reportTask, setReportTask] = useState<SendTask | null>(null);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const bySearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
        const byStatus = statusFilter === 'all' || task.status === statusFilter;
        const byChannel = channelFilter === 'all' || task.channel === channelFilter;
        return bySearch && byStatus && byChannel;
      }),
    [channelFilter, searchQuery, statusFilter, tasks]
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Button onClick={onCreateNew} className="w-fit gap-2">
              <Send className="w-4 h-4" />
              建立發送任務
            </Button>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-ph-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋任務名稱..."
                  className="pl-9 w-56"
                />
              </div>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as ChannelType | 'all')}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text"
              >
                <option value="all">全部渠道</option>
                <option value="push">App Push</option>
                <option value="line">LINE OA</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text"
              >
                <option value="all">全部狀態</option>
                <option value="draft">草稿</option>
                <option value="scheduled">已排程</option>
                <option value="sending">發送中</option>
                <option value="completed">已完成</option>
                <option value="failed">部分失敗</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任務名稱</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead>受眾</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">可觸達</TableHead>
                  <TableHead className="text-right">已送達</TableHead>
                  <TableHead>排程</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="font-medium text-ph-text">{task.name}</div>
                      <div className="text-xs text-ph-muted mt-0.5">範本：{task.templateName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-ph-secondary">
                        <ChannelIcon channel={task.channel} />
                        <span>{channelLabel[task.channel]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-ph-secondary">{task.audienceName}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(task.status)}>
                        {statusLabel[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-ph-secondary">
                      {task.metrics.reachable.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-ph-secondary">
                      {task.metrics.delivered.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-ph-muted">{task.scheduleAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReportTask(task)}
                          className="gap-1"
                        >
                          <BarChart3 className="w-3 h-3" />
                          報表
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDuplicate(task)}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          複製
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {reportTask && (
        <ReportDialog task={reportTask} onClose={() => setReportTask(null)} />
      )}
    </>
  );
}
