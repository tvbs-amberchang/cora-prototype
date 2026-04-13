// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Notify tab — notification rules and Slack/Email configuration

import React, { useState } from 'react';
import { Bell, Slack } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function NotifyTab() {
  const [notifyChannelError, setNotifyChannelError] = useState(true);
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [notifyExport, setNotifyExport] = useState(true);
  const [slackWebhookMasked, setSlackWebhookMasked] = useState(
    'https://hooks.slack.com/services/****'
  );

  return (
    <div className="space-y-6">
      {/* Notification rules */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          通知規則
        </h3>
        <div className="space-y-2">
          {[
            {
              label: '渠道健康檢查失敗（緊急）',
              checked: notifyChannelError,
              onChange: setNotifyChannelError,
            },
            {
              label: '預算達門檻告警',
              checked: notifyBudget,
              onChange: setNotifyBudget,
            },
            {
              label: '大量名單匯出（>10,000）',
              checked: notifyExport,
              onChange: setNotifyExport,
            },
          ].map(({ label, checked, onChange }) => (
            <label
              key={label}
              className="flex items-center justify-between border border-border rounded-md p-3 cursor-pointer hover:bg-ph-surface transition-colors"
            >
              <span className="text-sm text-ph-text">{label}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 accent-ph-text"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Slack / Email config */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Slack className="w-4 h-4" />
          Slack / Email 通知設定
        </h3>
        <div className="space-y-4">
          <label className="block text-sm text-ph-text">
            Slack Webhook（遮罩顯示）
            <Input
              value={slackWebhookMasked}
              onChange={(e) => setSlackWebhookMasked(e.target.value)}
              className="mt-1 font-mono"
            />
          </label>
          <label className="block text-sm text-ph-text">
            Email 收件群組
            <Input
              defaultValue="cora-admin@tvbs.com.tw, martech@tvbs.com.tw"
              className="mt-1"
            />
          </label>
          <div className="text-xs text-ph-secondary bg-ph-surface border border-border rounded-md p-3">
            通知歷史保留至少 6 個月；緊急事件預設後台+Email+Slack。
          </div>
        </div>
      </div>
    </div>
  );
}
