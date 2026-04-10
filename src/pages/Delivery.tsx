import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Mail,
  MessageCircle,
  MessageSquare,
  Search,
  Send,
  Smartphone,
} from
'lucide-react';

type ChannelType = 'push' | 'line' | 'sms' | 'email';
type TaskStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
type ScheduleMode = 'now' | 'later';
type LineMessageType = 'text' | 'image' | 'carousel';
type RuleMode = 'none' | 'strict';

interface AudienceOption {
  id: string;
  name: string;
  total: number;
  reachable: Record<ChannelType, number>;
}

interface DeliveryMetrics {
  target: number;
  reachable: number;
  skipped: number;
  skippedReasons: Record<string, number>;
  sent: number;
  delivered: number;
  failed: number;
  opens?: number;
  clicks?: number;
  unsubscribes?: number;
  bounces?: number;
  estimatedCost: number;
  actualCost: number;
}

interface SendTask {
  id: string;
  name: string;
  channel: ChannelType;
  audienceId: string;
  audienceName: string;
  templateName: string;
  senderIdentity: string;
  status: TaskStatus;
  scheduleAt: string;
  createdAt: string;
  metrics: DeliveryMetrics;
}

interface RuleConfig {
  dailyCapEnabled: boolean;
  dailyCap: number;
  allowedStartHour: number;
  allowedEndHour: number;
  perUserCapEnabled: boolean;
  perUserCap: number;
  budgetGuardEnabled: boolean;
  remainingBudget: number;
}

const audienceOptions: AudienceOption[] = [
{
  id: 'a1',
  name: '糖尿病活躍讀者',
  total: 50000,
  reachable: {
    push: 32000,
    line: 28600,
    sms: 21400,
    email: 25400
  }
},
{
  id: 'a2',
  name: '30天未活躍用戶',
  total: 18000,
  reachable: {
    push: 10200,
    line: 9300,
    sms: 12100,
    email: 9800
  }
},
{
  id: 'a3',
  name: '女大 VIP 會員',
  total: 62000,
  reachable: {
    push: 40200,
    line: 41800,
    sms: 33600,
    email: 38800
  }
},
{
  id: 'a4',
  name: '全站訂閱用戶',
  total: 125000,
  reachable: {
    push: 74000,
    line: 81000,
    sms: 67000,
    email: 92000
  }
}];

const channelHealth: Record<ChannelType, 'healthy' | 'warning' | 'down'> = {
  push: 'healthy',
  line: 'healthy',
  sms: 'warning',
  email: 'healthy'
};

const senderOptions: Record<ChannelType, string[]> = {
  push: ['健康 2.0 官方 App', '食尚玩家 App', '女人我最大 App'],
  line: ['健康 2.0 LINE OA', '食尚玩家 LINE OA', '女人我最大 LINE OA'],
  sms: ['【健康2.0】', '【食尚玩家】', '【女人我最大】'],
  email: [
  '健康 2.0 <health@tvbs.com.tw>',
  '食尚玩家 <supertaste@tvbs.com.tw>',
  '女人我最大 <woman@tvbs.com.tw>']
};

const initialTasks: SendTask[] = [
{
  id: 't1',
  name: '0415 糖尿病讀者推播',
  channel: 'push',
  audienceId: 'a1',
  audienceName: '糖尿病活躍讀者',
  templateName: '三月健康週報 Push',
  senderIdentity: '健康 2.0 官方 App',
  status: 'completed',
  scheduleAt: '2026-04-15 10:00',
  createdAt: '2026-04-14 18:22',
  metrics: {
    target: 50000,
    reachable: 32000,
    skipped: 18000,
    skippedReasons: { 'opt-in=false': 11900, '缺少 token': 6100 },
    sent: 32000,
    delivered: 31850,
    failed: 150,
    clicks: 5170,
    estimatedCost: 0,
    actualCost: 0
  }
},
{
  id: 't2',
  name: '母親節 LINE 群發',
  channel: 'line',
  audienceId: 'a3',
  audienceName: '女大 VIP 會員',
  templateName: '母親節 LINE 輪播',
  senderIdentity: '女人我最大 LINE OA',
  status: 'scheduled',
  scheduleAt: '2026-05-01 12:00',
  createdAt: '2026-04-20 09:00',
  metrics: {
    target: 62000,
    reachable: 41800,
    skipped: 20200,
    skippedReasons: { 'opt-in=false': 9800, '未綁定 line_uid': 10400 },
    sent: 0,
    delivered: 0,
    failed: 0,
    clicks: 0,
    unsubscribes: 0,
    estimatedCost: 33440,
    actualCost: 0
  }
},
{
  id: 't3',
  name: '沉睡用戶喚醒簡訊',
  channel: 'sms',
  audienceId: 'a2',
  audienceName: '30天未活躍用戶',
  templateName: '喚醒 SMS v2',
  senderIdentity: '【健康2.0】',
  status: 'failed',
  scheduleAt: '2026-04-20 15:00',
  createdAt: '2026-04-20 13:30',
  metrics: {
    target: 18000,
    reachable: 12100,
    skipped: 5900,
    skippedReasons: { 'opt-in=false': 2400, '缺少手機': 3500 },
    sent: 11800,
    delivered: 11520,
    failed: 280,
    clicks: 630,
    estimatedCost: 18880,
    actualCost: 18450
  }
}];

const channelLabel: Record<ChannelType, string> = {
  push: 'App Push',
  line: 'LINE OA',
  sms: 'SMS',
  email: 'Email'
};

const channelUnitCost: Record<ChannelType, number> = {
  push: 0,
  line: 0.8,
  sms: 0.8,
  email: 0.12
};

const channelDailyUsage: Record<ChannelType, number> = {
  push: 28000,
  line: 36000,
  sms: 9500,
  email: 41000
};

const averageMessagesPerUser: Record<ChannelType, number> = {
  push: 1,
  line: 1,
  sms: 1.2,
  email: 1
};

const statusBadge: Record<TaskStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-brand-100 text-brand-700',
  sending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700'
};

const statusLabel: Record<TaskStatus, string> = {
  draft: '草稿',
  scheduled: '已排程',
  sending: '發送中',
  completed: '已完成',
  failed: '部分失敗'
};

const ChannelIcon = ({ channel }: {channel: ChannelType;}) =>
channel === 'push' ? <Smartphone className="w-4 h-4 text-brand-500" /> :
channel === 'line' ? <MessageCircle className="w-4 h-4 text-green-600" /> :
channel === 'sms' ? <MessageSquare className="w-4 h-4 text-orange-600" /> :
<Mail className="w-4 h-4 text-purple-600" />;

const simulatePipeline = ({
  audience,
  channel,
  smsPerUser,
  rules,
  currentHour
}: {
  audience: AudienceOption;
  channel: ChannelType;
  smsPerUser: number;
  rules: RuleConfig;
  currentHour: number;
}): DeliveryMetrics => {
  const baseReachable = audience.reachable[channel];
  const skippedReasons: Record<string, number> = {
    'opt-in=false': Math.floor((audience.total - baseReachable) * 0.65),
    '缺少識別符': Math.ceil((audience.total - baseReachable) * 0.35)
  };

  let available = baseReachable;
  if (rules.perUserCapEnabled) {
    const approxBlocked = Math.floor(
      available * Math.max(0, averageMessagesPerUser[channel] - rules.perUserCap) * 0.15
    );
    if (approxBlocked > 0) {
      skippedReasons['每用戶頻率上限'] = approxBlocked;
      available -= approxBlocked;
    }
  }

  if (rules.dailyCapEnabled) {
    const remain = Math.max(0, rules.dailyCap - channelDailyUsage[channel]);
    if (available > remain) {
      skippedReasons['渠道每日上限'] = (skippedReasons['渠道每日上限'] ?? 0) + (available - remain);
      available = remain;
    }
  }

  if (currentHour < rules.allowedStartHour || currentHour >= rules.allowedEndHour) {
    skippedReasons['不在允許時段'] = (skippedReasons['不在允許時段'] ?? 0) + available;
    available = 0;
  }

  const unitCost = channelUnitCost[channel];
  const totalEstimated = channel === 'sms' ? available * unitCost * smsPerUser : available * unitCost;
  if (rules.budgetGuardEnabled && totalEstimated > rules.remainingBudget) {
    const allowedByBudget = unitCost === 0 ? available : Math.floor(rules.remainingBudget / (channel === 'sms' ? unitCost * smsPerUser : unitCost));
    const blocked = Math.max(0, available - allowedByBudget);
    if (blocked > 0) {
      skippedReasons['預算不足攔截'] = blocked;
      available = allowedByBudget;
    }
  }

  const sent = Math.max(0, Math.floor(available));
  const delivered = Math.max(0, Math.floor(sent * 0.985));
  const failed = Math.max(0, sent - delivered);
  const skipped = Object.values(skippedReasons).reduce((sum, count) => sum + count, 0);
  const opens = channel === 'email' ? Math.floor(delivered * 0.21) : channel === 'push' ? Math.floor(delivered * 0.13) : 0;
  const clicks = channel === 'line' ? Math.floor(delivered * 0.08) : channel === 'sms' ? Math.floor(delivered * 0.05) : Math.floor(delivered * 0.04);
  const unsubscribes = channel === 'line' || channel === 'email' ? Math.floor(delivered * 0.004) : 0;
  const bounces = channel === 'email' ? Math.floor(sent * 0.012) : 0;
  const estimatedCost = channel === 'sms' ? sent * unitCost * smsPerUser : sent * unitCost;
  const actualCost = estimatedCost * 0.98;

  return {
    target: audience.total,
    reachable: baseReachable,
    skipped,
    skippedReasons,
    sent,
    delivered,
    failed,
    opens,
    clicks,
    unsubscribes,
    bounces,
    estimatedCost,
    actualCost
  };
};

export default function Delivery() {
  const [tasks, setTasks] = useState<SendTask[]>(initialTasks);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelType | 'all'>('all');
  const [reportTask, setReportTask] = useState<SendTask | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('push');
  const [taskName, setTaskName] = useState('');
  const [selectedAudienceId, setSelectedAudienceId] = useState(audienceOptions[0].id);
  const [templateName, setTemplateName] = useState('');
  const [senderIdentity, setSenderIdentity] = useState(senderOptions.push[0]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [scheduleAt, setScheduleAt] = useState('2026-05-01T10:00');

  const [pushTitle, setPushTitle] = useState('專屬健康報告已生成');
  const [pushBody, setPushBody] = useState('{user.name} 您好，本週精選已為您準備完成。');
  const [lineType, setLineType] = useState<LineMessageType>('text');
  const [lineBody, setLineBody] = useState('今晚 8 點會員限定直播，點擊查看！');
  const [smsBody, setSmsBody] = useState('【健康2.0】{user.name} 您好，專屬內容：https://tvbs.to/abc12');
  const [emailSubject, setEmailSubject] = useState('{user.name}，本週健康精選推薦');
  const [emailPreheader, setEmailPreheader] = useState('3 篇你可能有興趣的內容');
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
    remainingBudget: 30000
  });

  const selectedAudience = useMemo(
    () => audienceOptions.find((a) => a.id === selectedAudienceId) ?? audienceOptions[0],
    [selectedAudienceId]
  );
  const activeRules = useMemo(
    () => (ruleMode === 'none' ? {
      ...rules,
      dailyCapEnabled: false,
      perUserCapEnabled: false,
      budgetGuardEnabled: false,
      allowedStartHour: 0,
      allowedEndHour: 24
    } : rules),
    [ruleMode, rules]
  );

  const smsPerUser = smsBody.length <= 70 ? 1 : Math.ceil(smsBody.length / 67);
  const simulatedMetrics = useMemo(
    () =>
    simulatePipeline({
      audience: selectedAudience,
      channel: selectedChannel,
      smsPerUser,
      rules: activeRules,
      currentHour: simHour
    }),
    [activeRules, selectedAudience, selectedChannel, simHour, smsPerUser]
  );

  const reachableCount = simulatedMetrics.reachable;
  const skipCount = simulatedMetrics.skipped;
  const estimatedCost = simulatedMetrics.estimatedCost;

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

  const resetCreateFlow = () => {
    setStep(1);
    setSelectedChannel('push');
    setTaskName('');
    setSelectedAudienceId(audienceOptions[0].id);
    setTemplateName('');
    setSenderIdentity(senderOptions.push[0]);
    setScheduleMode('now');
    setScheduleAt('2026-05-01T10:00');
    setRuleMode('strict');
    setSimHour(10);
    setRules({
      dailyCapEnabled: true,
      dailyCap: 50000,
      allowedStartHour: 9,
      allowedEndHour: 22,
      perUserCapEnabled: true,
      perUserCap: 1,
      budgetGuardEnabled: true,
      remainingBudget: 30000
    });
  };

  const openCreate = () => {
    resetCreateFlow();
    setView('create');
  };

  const onChannelChange = (channel: ChannelType) => {
    setSelectedChannel(channel);
    setSenderIdentity(senderOptions[channel][0]);
  };

  const completeCreate = () => {
    const now = new Date();
    const nextMetrics = simulatePipeline({
      audience: selectedAudience,
      channel: selectedChannel,
      smsPerUser,
      rules: activeRules,
      currentHour: simHour
    });
    const computedStatus: TaskStatus =
    scheduleMode === 'later' ? 'scheduled' :
    nextMetrics.sent === 0 ? 'failed' :
    nextMetrics.failed > 0 ? 'failed' :
    'completed';

    const newTask: SendTask = {
      id: `task_${Date.now()}`,
      name: taskName.trim() || `${channelLabel[selectedChannel]} 發送任務`,
      channel: selectedChannel,
      audienceId: selectedAudience.id,
      audienceName: selectedAudience.name,
      templateName: templateName.trim() || `${channelLabel[selectedChannel]} 範本`,
      senderIdentity,
      status: computedStatus,
      scheduleAt: scheduleMode === 'now' ? '立即發送' : scheduleAt.replace('T', ' '),
      createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
      metrics: nextMetrics
    };
    setTasks((prev) => [newTask, ...prev]);
    setView('list');
    setStep(1);
  };

  const duplicateTask = (task: SendTask) => {
    const copy: SendTask = {
      ...task,
      id: `task_${Date.now()}`,
      name: `${task.name}（複製）`,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setTasks((prev) => [copy, ...prev]);
  };

  if (view === 'create') {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => setView('list')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900">建立發送任務（5 步驟）</h1>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((item) =>
            <div key={item} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${step === item ? 'bg-brand-500 text-white' : step > item ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'}`}>
                {step > item ? <CheckCircle2 className="w-4 h-4" /> : item}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {step > 1 &&
            <button onClick={() => setStep((prev) => prev - 1)} className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700">
                上一步
              </button>
            }
            {step < 5 &&
            <button onClick={() => setStep((prev) => prev + 1)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">
                下一步
              </button>
            }
            {step === 5 &&
            <button onClick={completeCreate} className="px-3 py-1.5 bg-brand-500 text-white rounded text-xs flex items-center space-x-1">
                <Send className="w-3 h-3" />
                <span>確認發送</span>
              </button>
            }
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[520px_1fr] overflow-hidden">
          <div className="bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-6">
            {step === 1 &&
            <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Step 1：選渠道</h2>
                <input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="任務名稱（例如：0315 糖尿病讀者推播）"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  {(['push', 'line', 'sms', 'email'] as ChannelType[]).map((channel) =>
                <button
                  key={channel}
                  onClick={() => onChannelChange(channel)}
                  className={`text-left border rounded-lg p-3 ${selectedChannel === channel ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <ChannelIcon channel={channel} />
                        <span className="font-semibold text-slate-900">{channelLabel[channel]}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        連線狀態：
                        {channelHealth[channel] === 'healthy' && <span className="text-green-600">正常</span>}
                        {channelHealth[channel] === 'warning' && <span className="text-amber-600">警示</span>}
                        {channelHealth[channel] === 'down' && <span className="text-red-600">異常</span>}
                      </div>
                    </button>
                )}
                </div>
              </section>
            }

            {step === 2 &&
            <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Step 2：選受眾</h2>
                <select value={selectedAudienceId} onChange={(e) => setSelectedAudienceId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white">
                  {audienceOptions.map((audience) =>
                <option key={audience.id} value={audience.id}>
                      {audience.name}
                    </option>
                )}
                </select>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm space-y-2">
                  <div className="flex justify-between"><span>分群總人數</span><span className="font-mono">{selectedAudience.total.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>可觸達（{channelLabel[selectedChannel]}）</span><span className="font-mono text-brand-700">{reachableCount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>預估跳過</span><span className="font-mono text-slate-600">{skipCount.toLocaleString()}</span></div>
                </div>
              </section>
            }

            {step === 3 &&
            <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Step 3：編輯內容</h2>
                <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="範本名稱（可新建或引用）"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />

                {selectedChannel === 'push' &&
                <div className="space-y-3">
                    <input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} maxLength={50} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" placeholder="Push 標題（50 字內）" />
                    <textarea value={pushBody} onChange={(e) => setPushBody(e.target.value)} maxLength={200} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    <input className="w-full px-3 py-2 border border-slate-300 rounded text-sm" defaultValue="cora://article/12345" />
                  </div>
                }

                {selectedChannel === 'line' &&
                <div className="space-y-3">
                    <select value={lineType} onChange={(e) => setLineType(e.target.value as LineMessageType)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white">
                      <option value="text">文字訊息</option>
                      <option value="image">圖文訊息</option>
                      <option value="carousel">卡片輪播</option>
                    </select>
                    <textarea value={lineBody} onChange={(e) => setLineBody(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    {lineType !== 'text' && <input className="w-full px-3 py-2 border border-slate-300 rounded text-sm" placeholder="點擊連結 URL" />}
                  </div>
                }

                {selectedChannel === 'sms' &&
                <div className="space-y-3">
                    <textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} rows={5} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                      預估字數 {smsBody.length}，每人 {smsPerUser} 則。
                    </div>
                  </div>
                }

                {selectedChannel === 'email' &&
                <div className="space-y-3">
                    <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" placeholder="Email 主旨" />
                    <input value={emailPreheader} onChange={(e) => setEmailPreheader(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" placeholder="預覽文字（Preheader）" />
                    <div className="text-xs text-slate-600 border border-slate-200 rounded p-2">Email 區塊編輯器採模板 + 內容推薦區塊（CMS）模式。</div>
                  </div>
                }
              </section>
            }

            {step === 4 &&
            <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Step 4：預覽確認</h2>
                <select value={senderIdentity} onChange={(e) => setSenderIdentity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white">
                  {senderOptions[selectedChannel].map((sender) =>
                <option key={sender} value={sender}>
                      {sender}
                    </option>
                )}
                </select>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm">
                  <div>渠道：{channelLabel[selectedChannel]}</div>
                  <div>受眾：{selectedAudience.name}</div>
                  <div>範本：{templateName || `${channelLabel[selectedChannel]} 範本`}</div>
                  <div>發送身份：{senderIdentity}</div>
                </div>
                <button className="px-3 py-2 text-xs border border-slate-300 rounded bg-white">發送測試訊息給自己</button>
              </section>
            }

            {step === 5 &&
            <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Step 5：排程發送</h2>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="radio" checked={scheduleMode === 'now'} onChange={() => setScheduleMode('now')} />
                    <span>立即發送</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="radio" checked={scheduleMode === 'later'} onChange={() => setScheduleMode('later')} />
                    <span>排定時間</span>
                  </label>
                </div>
                {scheduleMode === 'later' &&
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                }
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">規則模式</label>
                    <select value={ruleMode} onChange={(e) => setRuleMode(e.target.value as RuleMode)} className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white">
                      <option value="strict">啟用規則攔截</option>
                      <option value="none">僅看基礎可觸達</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">模擬當前時段（0-23）</label>
                    <input type="range" min={0} max={23} value={simHour} onChange={(e) => setSimHour(Number(e.target.value))} className="w-full" />
                    <div className="text-xs text-slate-500">目前：{simHour}:00</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="border border-slate-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span>渠道每日上限</span>
                        <input type="checkbox" checked={rules.dailyCapEnabled} onChange={(e) => setRules((prev) => ({ ...prev, dailyCapEnabled: e.target.checked }))} />
                      </div>
                      <input type="number" value={rules.dailyCap} onChange={(e) => setRules((prev) => ({ ...prev, dailyCap: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    </label>
                    <label className="border border-slate-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span>每用戶上限</span>
                        <input type="checkbox" checked={rules.perUserCapEnabled} onChange={(e) => setRules((prev) => ({ ...prev, perUserCapEnabled: e.target.checked }))} />
                      </div>
                      <input type="number" value={rules.perUserCap} onChange={(e) => setRules((prev) => ({ ...prev, perUserCap: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    </label>
                    <label className="border border-slate-200 rounded p-2">
                      <div className="mb-1">允許時段起</div>
                      <input type="number" min={0} max={23} value={rules.allowedStartHour} onChange={(e) => setRules((prev) => ({ ...prev, allowedStartHour: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    </label>
                    <label className="border border-slate-200 rounded p-2">
                      <div className="mb-1">允許時段迄</div>
                      <input type="number" min={1} max={24} value={rules.allowedEndHour} onChange={(e) => setRules((prev) => ({ ...prev, allowedEndHour: Number(e.target.value) || 24 }))} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    </label>
                  </div>
                  <label className="border border-slate-200 rounded p-2 text-xs block">
                    <div className="flex items-center justify-between mb-1">
                      <span>預算保護</span>
                      <input type="checkbox" checked={rules.budgetGuardEnabled} onChange={(e) => setRules((prev) => ({ ...prev, budgetGuardEnabled: e.target.checked }))} />
                    </div>
                    <input type="number" value={rules.remainingBudget} onChange={(e) => setRules((prev) => ({ ...prev, remainingBudget: Number(e.target.value) || 0 }))} className="w-full px-2 py-1 border border-slate-300 rounded" />
                  </label>
                </div>
                <div className="bg-slate-900 text-white rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-300">可觸達人數</span><span>{reachableCount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300">規則後可送出</span><span>{simulatedMetrics.sent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300">預估費用</span><span className="font-mono">${Math.round(estimatedCost).toLocaleString()}</span></div>
                  {selectedChannel === 'sms' &&
                  <div className="text-xs text-amber-300 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>SMS 將拆分 {smsPerUser} 則/人，請確認預算。</span>
                    </div>
                  }
                </div>
                <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-700">管線攔截結果</div>
                  {Object.entries(simulatedMetrics.skippedReasons).map(([reason, count]) =>
                <div key={reason} className="flex justify-between">
                      <span>{reason}</span>
                      <span className="font-mono">{count.toLocaleString()}</span>
                    </div>
                )}
                </div>
              </section>
            }
          </div>

          <div className="bg-slate-100 p-8 flex items-center justify-center">
            <div className="w-[320px] h-[620px] bg-white border border-slate-300 rounded-[1.5rem] p-4 relative overflow-hidden">
              <div className="text-[11px] text-slate-500 mb-3">即時預覽（{channelLabel[selectedChannel]}）</div>
              {selectedChannel === 'push' &&
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-xs font-semibold text-slate-900 mb-1">{pushTitle}</div>
                  <div className="text-xs text-slate-600">{pushBody.replace('{user.name}', '王小明')}</div>
                </div>
              }
              {selectedChannel === 'line' &&
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  [{lineType}] {lineBody}
                </div>
              }
              {selectedChannel === 'sms' &&
              <div className="rounded-2xl bg-slate-200 text-slate-900 p-3 text-sm">{smsBody.replace('{user.name}', '王小明')}</div>
              }
              {selectedChannel === 'email' &&
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-semibold text-slate-900 mb-1">{emailSubject.replace('{user.name}', '王小明')}</div>
                  <div className="text-xs text-slate-500 mb-3">{emailPreheader}</div>
                  <div className="space-y-2">
                    <div className="h-16 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 w-4/5 bg-slate-200 rounded" />
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">訊息遞送</h1>
        <p className="text-slate-500">統一管理 Push / LINE / SMS / Email 的發送任務、規則攔截與成效追蹤</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <button onClick={openCreate} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>建立發送任務</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜尋任務名稱..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-56" />
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as ChannelType | 'all')} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="all">全部渠道</option>
              <option value="push">App Push</option>
              <option value="line">LINE OA</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="all">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="scheduled">已排程</option>
              <option value="sending">發送中</option>
              <option value="completed">已完成</option>
              <option value="failed">部分失敗</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">任務名稱</th>
                <th className="px-4 py-3">渠道</th>
                <th className="px-4 py-3">受眾</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3 text-right">可觸達</th>
                <th className="px-4 py-3 text-right">已送達</th>
                <th className="px-4 py-3">排程</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) =>
              <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{task.name}</div>
                    <div className="text-xs text-slate-500 mt-1">範本：{task.templateName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <ChannelIcon channel={task.channel} />
                      <span>{channelLabel[task.channel]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{task.audienceName}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono">{task.metrics.reachable.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right font-mono">{task.metrics.delivered.toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{task.scheduleAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => setReportTask(task)} className="px-2 py-1 border border-slate-300 rounded text-xs hover:bg-slate-50 flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>報表</span>
                      </button>
                      <button onClick={() => duplicateTask(task)} className="px-2 py-1 border border-slate-300 rounded text-xs hover:bg-slate-50 flex items-center space-x-1">
                        <Copy className="w-3 h-3" />
                        <span>複製</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reportTask &&
      <div className="fixed inset-0 bg-slate-900/50 z-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{reportTask.name} 發送報表</h2>
              <button onClick={() => setReportTask(null)} className="text-slate-500 hover:text-slate-700">關閉</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded p-3">目標人數<div className="font-mono font-semibold">{reportTask.metrics.target.toLocaleString()}</div></div>
                <div className="border border-slate-200 rounded p-3">可觸達<div className="font-mono font-semibold">{reportTask.metrics.reachable.toLocaleString()}</div></div>
                <div className="border border-slate-200 rounded p-3">跳過人數<div className="font-mono font-semibold">{reportTask.metrics.skipped.toLocaleString()}</div></div>
                <div className="border border-slate-200 rounded p-3">已送出<div className="font-mono font-semibold">{reportTask.metrics.sent.toLocaleString()}</div></div>
                <div className="border border-slate-200 rounded p-3">已送達<div className="font-mono font-semibold">{reportTask.metrics.delivered.toLocaleString()}</div></div>
                <div className="border border-slate-200 rounded p-3">失敗<div className="font-mono font-semibold text-red-600">{reportTask.metrics.failed.toLocaleString()}</div></div>
              </div>

              <div className="border border-slate-200 rounded p-3">
                <div className="font-semibold text-slate-900 mb-2">跳過原因分佈</div>
                <div className="space-y-1 text-xs">
                  {Object.entries(reportTask.metrics.skippedReasons).map(([reason, count]) =>
                <div key={reason} className="flex justify-between">
                      <span>{reason}</span>
                      <span className="font-mono">{count.toLocaleString()}</span>
                    </div>
                )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded p-3">
                  <div className="font-semibold text-slate-900 mb-2">互動指標</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>開啟數</span><span className="font-mono">{(reportTask.metrics.opens ?? 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>點擊數</span><span className="font-mono">{(reportTask.metrics.clicks ?? 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>退訂數</span><span className="font-mono">{(reportTask.metrics.unsubscribes ?? 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>退信數</span><span className="font-mono">{(reportTask.metrics.bounces ?? 0).toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded p-3">
                  <div className="font-semibold text-slate-900 mb-2">費用摘要</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>預估費用</span><span className="font-mono">${Math.round(reportTask.metrics.estimatedCost).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>實際費用</span><span className="font-mono">${Math.round(reportTask.metrics.actualCost).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>渠道單價</span><span className="font-mono">${channelUnitCost[reportTask.channel]}</span></div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-start space-x-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                <span>事件回寫：`message_sent` / `message_delivered` / `message_failed`，以及渠道互動事件（`notification_click`、`email_open`、`email_click`、`email_unsubscribe`）。</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);
}
