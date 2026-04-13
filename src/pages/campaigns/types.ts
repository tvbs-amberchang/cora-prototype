// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Shared types and constants for the Campaigns feature

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'ended';
export type CampaignContentType = 'card' | 'survey' | 'lottery' | 'checkin';
export type ModuleType = 'inline' | 'popup';
export type LotteryMode = 'register' | 'instant';
export type Brand = 'health' | 'supertaste' | 'woman';
export type PopupPosition = 'bottom' | 'right-bottom' | 'left-bottom';
export type TemplateTheme = 'default' | 'health' | 'warm';

export interface FrequencyControl {
  hideAfterComplete: boolean;
  perDayLimit: number;
  globalDailyLimit: number;
  cooldownHours: number;
  lifetimeLimit: number;
}

export interface Prize {
  id: string;
  name: string;
  stock: number;
  remaining: number;
  weight: number;
}

export interface CampaignMetrics {
  impressions: number;
  interactions: number;
  completions: number;
  surveyAnswerRate?: number;
  lotteryWinners?: number;
  checkinGoalReached?: number;
}

export interface Campaign {
  id: string;
  name: string;
  brand: Brand;
  contentType: CampaignContentType;
  moduleType: ModuleType;
  status: CampaignStatus;
  startAt: string;
  endAt: string;
  ga4Sync: boolean;
  triggers: string[];
  frequency: FrequencyControl;
  metrics: CampaignMetrics;
  lotteryMode?: LotteryMode;
  prizes?: Prize[];
  checkinCycleDays?: number;
  checkinRewardLinkedLotteryId?: string;
  popupPosition: PopupPosition;
  templateTheme: TemplateTheme;
  headline: string;
  subheadline: string;
  ctaText: string;
  surveyOptions?: string[];
}

export const brandMap: Record<Brand, string> = {
  health: '健康 2.0',
  supertaste: '食尚玩家',
  woman: '女人我最大',
};

export const typeLabel = (type: CampaignContentType): string =>
  type === 'card' ? '行銷卡片' :
  type === 'survey' ? '問卷' :
  type === 'lottery' ? '抽獎' :
  '簽到';

export const defaultCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: '健康主題偏好問卷',
    brand: 'health',
    contentType: 'survey',
    moduleType: 'popup',
    status: 'active',
    startAt: '2026-04-01T00:00',
    endAt: '2026-04-30T23:59',
    ga4Sync: false,
    triggers: ['brand=health', '頁面停留 > 30 秒', 'segment: 糖尿病活躍讀者'],
    frequency: { hideAfterComplete: true, perDayLimit: 2, globalDailyLimit: 5, cooldownHours: 24, lifetimeLimit: 3 },
    metrics: { impressions: 45200, interactions: 22800, completions: 12500, surveyAnswerRate: 54.8 },
    popupPosition: 'bottom',
    templateTheme: 'health',
    headline: '你對哪些健康主題有興趣？',
    subheadline: '完成後可獲得更精準內容推薦',
    ctaText: '送出',
    surveyOptions: ['減重瘦身', '糖尿病照護', '心血管保健'],
  },
  {
    id: 'c2',
    name: '女大母親節抽獎',
    brand: 'woman',
    contentType: 'lottery',
    moduleType: 'inline',
    status: 'active',
    startAt: '2026-04-05T00:00',
    endAt: '2026-05-10T23:59',
    ga4Sync: true,
    triggers: ['brand=woman', 'content_category=beauty'],
    frequency: { hideAfterComplete: false, perDayLimit: 1, globalDailyLimit: 5, cooldownHours: 24, lifetimeLimit: 5 },
    metrics: { impressions: 89000, interactions: 45000, completions: 45000, lotteryWinners: 320 },
    lotteryMode: 'register',
    prizes: [
      { id: 'p1', name: '保養組 A', stock: 200, remaining: 17, weight: 40 },
      { id: 'p2', name: '保養組 B', stock: 150, remaining: 0, weight: 35 },
      { id: 'p3', name: '小樣組', stock: 500, remaining: 112, weight: 25 },
    ],
    popupPosition: 'bottom',
    templateTheme: 'warm',
    headline: '母親節感恩抽獎',
    subheadline: '專櫃保養品限量中',
    ctaText: '立即參加',
  },
  {
    id: 'c3',
    name: '食尚 7 天簽到任務',
    brand: 'supertaste',
    contentType: 'checkin',
    moduleType: 'popup',
    status: 'scheduled',
    startAt: '2026-05-01T00:00',
    endAt: '2026-05-31T23:59',
    ga4Sync: false,
    triggers: ['brand=supertaste', '當日首次進站'],
    frequency: { hideAfterComplete: false, perDayLimit: 1, globalDailyLimit: 5, cooldownHours: 12, lifetimeLimit: 30 },
    metrics: { impressions: 0, interactions: 0, completions: 0, checkinGoalReached: 0 },
    checkinCycleDays: 7,
    checkinRewardLinkedLotteryId: 'c2',
    popupPosition: 'right-bottom',
    templateTheme: 'default',
    headline: '連續簽到任務',
    subheadline: '連續 7 天可獲抽獎資格',
    ctaText: '今日簽到',
  },
];
