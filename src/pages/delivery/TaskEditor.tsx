// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Multi-step task creation form with channel selection, audience, content, preview, schedule/rules

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  AudienceOption,
  ChannelType,
  LineMessageType,
  RuleConfig,
  RuleMode,
  ScheduleMode,
  SendTask,
} from './types';
import {
  audienceOptions,
  averageMessagesPerUser,
  channelDailyUsage,
  channelHealth,
  channelLabel,
  channelUnitCost,
  senderOptions,
  simulatePipeline,
} from './types';

// ---- Channel icon ----
const ChannelIcon = ({ channel }: { channel: ChannelType }) =>
  channel === 'push' ? <Smartphone className="w-4 h-4 text-blue-500" /> :
  channel === 'line' ? <MessageCircle className="w-4 h-4 text-green-600" /> :
  channel === 'sms' ? <MessageSquare className="w-4 h-4 text-orange-600" /> :
  <Mail className="w-4 h-4 text-purple-600" />;

// ---- Props ----
interface TaskEditorProps {
  onBack: () => void;
  onComplete: (task: Omit<SendTask, 'id' | 'createdAt'> & { metrics: ReturnType<typeof simulatePipeline> }) => void;
}

export function TaskEditor({ onBack, onComplete }: TaskEditorProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('push');
  const [taskName, setTaskName] = useState('');

  // Step 2
  const [selectedAudienceId, setSelectedAudienceId] = useState(audienceOptions[0].id);

  // Step 3
  const [templateName, setTemplateName] = useState('');
  const [pushTitle, setPushTitle] = useState('專屬健康報告已生成');
  const [pushBody, setPushBody] = useState('{user.name} 您好，本週精選已為您準備完成。');
  const [lineType, setLineType] = useState<LineMessageType>('text');
  const [lineBody, setLineBody] = useState('今晚 8 點會員限定直播，點擊查看！');
  const [smsBody, setSmsBody] = useState('【健康2.0】{user.name} 您好，專屬內容：https://tvbs.to/abc12');
  const [emailSubject, setEmailSubject] = useState('{user.name}，本週健康精選推薦');
  const [emailPreheader, setEmailPreheader] = useState('3 篇你可能有興趣的內容');

  // Step 4
  const [senderIdentity, setSenderIdentity] = useState(senderOptions.push[0]);

  // Step 5
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [scheduleAt, setScheduleAt] = useState('2026-05-01T10:00');
  const [ruleMode, setRuleMode] = useState<RuleMode>('strict');
  const [simHour, setSimHour] = useState(10);
  const [rules, setRules] = useState<RuleConfig>({
    dailyCapEnabled: true,
    dailyCap: 50000,
    allowedStartHour: 9,
    allowedEndHour: 22,
    perUserCapEnabled: true,
    perUserCap: 1,
    budgetGuardEnabled: true,
    remainingBudget: 30000,
  });

  const selectedAudience: AudienceOption =
    audienceOptions.find((a) => a.id === selectedAudienceId) ?? audienceOptions[0];

  const activeRules = ruleMode === 'none'
    ? { ...rules, dailyCapEnabled: false, perUserCapEnabled: false, budgetGuardEnabled: false, allowedStartHour: 0, allowedEndHour: 24 }
    : rules;

  const smsPerUser = smsBody.length <= 70 ? 1 : Math.ceil(smsBody.length / 67);

  const simulatedMetrics = useMemo(
    () => simulatePipeline({ audience: selectedAudience, channel: selectedChannel, smsPerUser, rules: activeRules, currentHour: simHour }),
    [activeRules, selectedAudience, selectedChannel, simHour, smsPerUser]
  );

  const onChannelChange = (channel: ChannelType) => {
    setSelectedChannel(channel);
    setSenderIdentity(senderOptions[channel][0]);
  };

  const handleComplete = () => {
    onComplete({
      name: taskName.trim() || `${channelLabel[selectedChannel]} 發送任務`,
      channel: selectedChannel,
      audienceId: selectedAudience.id,
      audienceName: selectedAudience.name,
      templateName: templateName.trim() || `${channelLabel[selectedChannel]} 範本`,
      senderIdentity,
      status: scheduleMode === 'later' ? 'scheduled' : simulatedMetrics.sent === 0 || simulatedMetrics.failed > 0 ? 'failed' : 'completed',
      scheduleAt: scheduleMode === 'now' ? '立即發送' : scheduleAt.replace('T', ' '),
      metrics: simulatedMetrics,
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-ph-surface">
      {/* Header */}
      <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold text-ph-text">建立發送任務（5 步驟）</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                step === item ? 'bg-ph-text text-white' :
                step > item ? 'bg-ph-text/20 text-ph-text' :
                'bg-ph-surface text-ph-muted border border-border'
              }`}
            >
              {step > item ? <CheckCircle2 className="w-4 h-4" /> : item}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>上一步</Button>
          )}
          {step < 5 && (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>下一步</Button>
          )}
          {step === 5 && (
            <Button size="sm" onClick={handleComplete} className="gap-1">
              <Send className="w-3 h-3" />
              確認發送
            </Button>
          )}
        </div>
      </div>

      {/* Body: form + preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[520px_1fr] overflow-hidden">
        {/* Left: form */}
        <div className="bg-background border-r border-border overflow-y-auto p-6 space-y-6">

          {/* Step 1: Channel */}
          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ph-text">Step 1：選渠道</h2>
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="任務名稱（例如：0315 糖尿病讀者推播）"
              />
              <div className="grid grid-cols-2 gap-3">
                {(['push', 'line', 'sms', 'email'] as ChannelType[]).map((channel) => (
                  <button
                    key={channel}
                    onClick={() => onChannelChange(channel)}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      selectedChannel === channel
                        ? 'border-ph-text bg-ph-surface'
                        : 'border-border bg-background hover:bg-ph-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ChannelIcon channel={channel} />
                      <span className="font-medium text-ph-text text-sm">{channelLabel[channel]}</span>
                    </div>
                    <div className="text-xs text-ph-muted">
                      連線狀態：{' '}
                      {channelHealth[channel] === 'healthy' && <span className="text-green-600">正常</span>}
                      {channelHealth[channel] === 'warning' && <span className="text-amber-600">警示</span>}
                      {channelHealth[channel] === 'down' && <span className="text-destructive">異常</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ph-text">Step 2：選受眾</h2>
              <select
                value={selectedAudienceId}
                onChange={(e) => setSelectedAudienceId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text"
              >
                {audienceOptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="border border-border rounded-lg p-4 bg-ph-surface text-sm space-y-2">
                <div className="flex justify-between text-ph-secondary">
                  <span>分群總人數</span>
                  <span className="font-mono">{selectedAudience.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ph-secondary">可觸達（{channelLabel[selectedChannel]}）</span>
                  <span className="font-mono font-medium text-ph-text">{simulatedMetrics.reachable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ph-secondary">
                  <span>預估跳過</span>
                  <span className="font-mono">{simulatedMetrics.skipped.toLocaleString()}</span>
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Content */}
          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ph-text">Step 3：編輯內容</h2>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="範本名稱（可新建或引用）"
              />

              {selectedChannel === 'push' && (
                <div className="space-y-3">
                  <Input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} maxLength={50} placeholder="Push 標題（50 字內）" />
                  <textarea
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    maxLength={200}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text resize-none"
                  />
                  <Input defaultValue="cora://article/12345" />
                </div>
              )}

              {selectedChannel === 'line' && (
                <div className="space-y-3">
                  <select
                    value={lineType}
                    onChange={(e) => setLineType(e.target.value as LineMessageType)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text"
                  >
                    <option value="text">文字訊息</option>
                    <option value="image">圖文訊息</option>
                    <option value="carousel">卡片輪播</option>
                  </select>
                  <textarea
                    value={lineBody}
                    onChange={(e) => setLineBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text resize-none"
                  />
                  {lineType !== 'text' && <Input placeholder="點擊連結 URL" />}
                </div>
              )}

              {selectedChannel === 'sms' && (
                <div className="space-y-3">
                  <textarea
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text resize-none"
                  />
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    預估字數 {smsBody.length}，每人 {smsPerUser} 則。
                  </div>
                </div>
              )}

              {selectedChannel === 'email' && (
                <div className="space-y-3">
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email 主旨" />
                  <Input value={emailPreheader} onChange={(e) => setEmailPreheader(e.target.value)} placeholder="預覽文字（Preheader）" />
                  <div className="text-xs text-ph-secondary border border-border rounded-md p-2">
                    Email 區塊編輯器採模板 + 內容推薦區塊（CMS）模式。
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 4: Preview / Sender */}
          {step === 4 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ph-text">Step 4：預覽確認</h2>
              <select
                value={senderIdentity}
                onChange={(e) => setSenderIdentity(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ph-text"
              >
                {senderOptions[selectedChannel].map((sender) => (
                  <option key={sender} value={sender}>{sender}</option>
                ))}
              </select>
              <div className="border border-border rounded-lg p-4 bg-ph-surface text-sm space-y-1 text-ph-secondary">
                <div>渠道：{channelLabel[selectedChannel]}</div>
                <div>受眾：{selectedAudience.name}</div>
                <div>範本：{templateName || `${channelLabel[selectedChannel]} 範本`}</div>
                <div>發送身份：{senderIdentity}</div>
              </div>
              <Button variant="outline" size="sm">發送測試訊息給自己</Button>
            </section>
          )}

          {/* Step 5: Schedule + Rules */}
          {step === 5 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ph-text">Step 5：排程發送</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-ph-secondary">
                  <input type="radio" checked={scheduleMode === 'now'} onChange={() => setScheduleMode('now')} />
                  立即發送
                </label>
                <label className="flex items-center gap-2 text-sm text-ph-secondary">
                  <input type="radio" checked={scheduleMode === 'later'} onChange={() => setScheduleMode('later')} />
                  排定時間
                </label>
              </div>
              {scheduleMode === 'later' && (
                <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
              )}

              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ph-text">規則模式</span>
                  <select
                    value={ruleMode}
                    onChange={(e) => setRuleMode(e.target.value as RuleMode)}
                    className="px-3 py-1.5 border border-border rounded-md text-xs bg-background text-ph-text"
                  >
                    <option value="strict">啟用規則攔截</option>
                    <option value="none">僅看基礎可觸達</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ph-secondary mb-1">模擬當前時段（0-23）</label>
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={simHour}
                    onChange={(e) => setSimHour(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-ph-muted">目前：{simHour}:00</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-ph-secondary">
                  <label className="border border-border rounded-md p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span>渠道每日上限</span>
                      <input type="checkbox" checked={rules.dailyCapEnabled} onChange={(e) => setRules((p) => ({ ...p, dailyCapEnabled: e.target.checked }))} />
                    </div>
                    <input type="number" value={rules.dailyCap} onChange={(e) => setRules((p) => ({ ...p, dailyCap: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-border rounded-md text-xs" />
                  </label>
                  <label className="border border-border rounded-md p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span>每用戶上限</span>
                      <input type="checkbox" checked={rules.perUserCapEnabled} onChange={(e) => setRules((p) => ({ ...p, perUserCapEnabled: e.target.checked }))} />
                    </div>
                    <input type="number" value={rules.perUserCap} onChange={(e) => setRules((p) => ({ ...p, perUserCap: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-border rounded-md text-xs" />
                  </label>
                  <label className="border border-border rounded-md p-2">
                    <div className="mb-1">允許時段起</div>
                    <input type="number" min={0} max={23} value={rules.allowedStartHour} onChange={(e) => setRules((p) => ({ ...p, allowedStartHour: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-border rounded-md text-xs" />
                  </label>
                  <label className="border border-border rounded-md p-2">
                    <div className="mb-1">允許時段迄</div>
                    <input type="number" min={1} max={24} value={rules.allowedEndHour} onChange={(e) => setRules((p) => ({ ...p, allowedEndHour: Number(e.target.value) || 24 }))} className="w-full px-2 py-1 border border-border rounded-md text-xs" />
                  </label>
                </div>
                <label className="border border-border rounded-md p-2 text-xs text-ph-secondary block">
                  <div className="flex items-center justify-between mb-1">
                    <span>預算保護</span>
                    <input type="checkbox" checked={rules.budgetGuardEnabled} onChange={(e) => setRules((p) => ({ ...p, budgetGuardEnabled: e.target.checked }))} />
                  </div>
                  <input type="number" value={rules.remainingBudget} onChange={(e) => setRules((p) => ({ ...p, remainingBudget: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-border rounded-md text-xs" />
                </label>
              </div>

              {/* Summary card */}
              <div className="bg-ph-text text-white rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">可觸達人數</span>
                  <span>{simulatedMetrics.reachable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">規則後可送出</span>
                  <span>{simulatedMetrics.sent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">預估費用</span>
                  <span className="font-mono">${Math.round(simulatedMetrics.estimatedCost).toLocaleString()}</span>
                </div>
                {selectedChannel === 'sms' && (
                  <div className="text-xs text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    SMS 將拆分 {smsPerUser} 則/人，請確認預算。
                  </div>
                )}
              </div>

              {/* Pipeline intercept breakdown */}
              <div className="border border-border rounded-lg p-3 text-xs space-y-1">
                <div className="font-medium text-ph-text mb-1">管線攔截結果</div>
                {Object.entries(simulatedMetrics.skippedReasons).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between text-ph-secondary">
                    <span>{reason}</span>
                    <span className="font-mono">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: live preview */}
        <div className="bg-ph-surface p-8 flex items-center justify-center">
          <div className="w-[320px] h-[620px] bg-background border border-border rounded-[1.5rem] p-4 relative overflow-hidden shadow-sm">
            <div className="text-[11px] text-ph-muted mb-3">即時預覽（{channelLabel[selectedChannel]}）</div>
            {selectedChannel === 'push' && (
              <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
                <div className="text-xs font-semibold text-ph-text mb-1">{pushTitle}</div>
                <div className="text-xs text-ph-secondary">{pushBody.replace('{user.name}', '王小明')}</div>
              </div>
            )}
            {selectedChannel === 'line' && (
              <div className="rounded-xl border border-border bg-background p-3 text-xs text-ph-secondary">
                [{lineType}] {lineBody}
              </div>
            )}
            {selectedChannel === 'sms' && (
              <div className="rounded-2xl bg-ph-surface text-ph-text p-3 text-sm">
                {smsBody.replace('{user.name}', '王小明')}
              </div>
            )}
            {selectedChannel === 'email' && (
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="text-sm font-semibold text-ph-text mb-1">{emailSubject.replace('{user.name}', '王小明')}</div>
                <div className="text-xs text-ph-muted mb-3">{emailPreheader}</div>
                <div className="space-y-2">
                  <div className="h-16 bg-ph-surface rounded" />
                  <div className="h-3 bg-ph-surface rounded" />
                  <div className="h-3 w-4/5 bg-ph-surface rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
