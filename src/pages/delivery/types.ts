// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Shared types, mock data, and pipeline simulation for Delivery module

export type ChannelType = 'push' | 'line' | 'sms' | 'email';
export type TaskStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
export type ScheduleMode = 'now' | 'later';
export type LineMessageType = 'text' | 'image' | 'carousel';
export type RuleMode = 'none' | 'strict';

export interface AudienceOption {
  id: string;
  name: string;
  total: number;
  reachable: Record<ChannelType, number>;
}

export interface DeliveryMetrics {
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

export interface SendTask {
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

export interface RuleConfig {
  dailyCapEnabled: boolean;
  dailyCap: number;
  allowedStartHour: number;
  allowedEndHour: number;
  perUserCapEnabled: boolean;
  perUserCap: number;
  budgetGuardEnabled: boolean;
  remainingBudget: number;
}

// ---- Mock data ----

export const audienceOptions: AudienceOption[] = [
  {
    id: 'a1',
    name: '糖尿病活躍讀者',
    total: 50000,
    reachable: { push: 32000, line: 28600, sms: 21400, email: 25400 },
  },
  {
    id: 'a2',
    name: '30天未活躍用戶',
    total: 18000,
    reachable: { push: 10200, line: 9300, sms: 12100, email: 9800 },
  },
  {
    id: 'a3',
    name: '女大 VIP 會員',
    total: 62000,
    reachable: { push: 40200, line: 41800, sms: 33600, email: 38800 },
  },
  {
    id: 'a4',
    name: '全站訂閱用戶',
    total: 125000,
    reachable: { push: 74000, line: 81000, sms: 67000, email: 92000 },
  },
];

export const channelHealth: Record<ChannelType, 'healthy' | 'warning' | 'down'> = {
  push: 'healthy',
  line: 'healthy',
  sms: 'warning',
  email: 'healthy',
};

export const senderOptions: Record<ChannelType, string[]> = {
  push: ['健康 2.0 官方 App', '食尚玩家 App', '女人我最大 App'],
  line: ['健康 2.0 LINE OA', '食尚玩家 LINE OA', '女人我最大 LINE OA'],
  sms: ['【健康2.0】', '【食尚玩家】', '【女人我最大】'],
  email: [
    '健康 2.0 <health@tvbs.com.tw>',
    '食尚玩家 <supertaste@tvbs.com.tw>',
    '女人我最大 <woman@tvbs.com.tw>',
  ],
};

export const initialTasks: SendTask[] = [
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
      actualCost: 0,
    },
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
      actualCost: 0,
    },
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
      actualCost: 18450,
    },
  },
];

export const channelLabel: Record<ChannelType, string> = {
  push: 'App Push',
  line: 'LINE OA',
  sms: 'SMS',
  email: 'Email',
};

export const channelUnitCost: Record<ChannelType, number> = {
  push: 0,
  line: 0.8,
  sms: 0.8,
  email: 0.12,
};

export const channelDailyUsage: Record<ChannelType, number> = {
  push: 28000,
  line: 36000,
  sms: 9500,
  email: 41000,
};

export const averageMessagesPerUser: Record<ChannelType, number> = {
  push: 1,
  line: 1,
  sms: 1.2,
  email: 1,
};

export const statusLabel: Record<TaskStatus, string> = {
  draft: '草稿',
  scheduled: '已排程',
  sending: '發送中',
  completed: '已完成',
  failed: '部分失敗',
};

// ---- Pipeline simulation ----

export const simulatePipeline = ({
  audience,
  channel,
  smsPerUser,
  rules,
  currentHour,
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
    '缺少識別符': Math.ceil((audience.total - baseReachable) * 0.35),
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
    const allowedByBudget = unitCost === 0
      ? available
      : Math.floor(rules.remainingBudget / (channel === 'sms' ? unitCost * smsPerUser : unitCost));
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
    actualCost,
  };
};
