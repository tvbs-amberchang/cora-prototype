// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Shared types and mock data for PeopleView sub-components

export type SearchType = 'email' | 'phone' | 'cora_id' | 'member_id';
export type TimeRange = '24h' | '7d' | '30d';

export interface SearchResult {
  id: string;
  cora_id: string;
  member_id: string | null;
  email: string;
  phone: string | null;
  lastActive: string;
  activeBrands: string[];
  reachableChannels: string[];
}

export interface TimelineEvent {
  id: number;
  timestamp: string;
  type: string;
  brand: string;
  detail: string;
  isKeyEvent: boolean;
}

export const mockResults: SearchResult[] = [
  {
    id: '1',
    cora_id: 'cora_8f7d6e5c4b3a2',
    member_id: 'm_100452',
    email: 'j***@gmail.com',
    phone: '0912***789',
    lastActive: '10 分鐘前',
    activeBrands: ['health', 'supertaste'],
    reachableChannels: ['app_push', 'email'],
  },
  {
    id: '2',
    cora_id: 'cora_2a3b4c5d6e7f8',
    member_id: null,
    email: 'j***@yahoo.com.tw',
    phone: null,
    lastActive: '2 天前',
    activeBrands: ['woman'],
    reachableChannels: ['web_push'],
  },
];

export const mockEvents: TimelineEvent[] = [
  { id: 1, timestamp: '2026-04-08T09:30:22', type: 'page_view', brand: 'health', detail: '文章：糖尿病飲食指南', isKeyEvent: false },
  { id: 2, timestamp: '2026-04-08T09:28:15', type: 'app_open', brand: 'health', detail: 'iOS App 開啟', isKeyEvent: true },
  { id: 3, timestamp: '2026-04-08T08:40:02', type: 'notification_click', brand: 'health', detail: '點擊推播：本週健康重點', isKeyEvent: true },
  { id: 4, timestamp: '2026-04-08T07:22:11', type: 'video_play', brand: 'health', detail: '影片：減重迷思破解', isKeyEvent: false },
  { id: 5, timestamp: '2026-04-07T22:18:09', type: 'page_view', brand: 'supertaste', detail: '文章：台北宵夜地圖', isKeyEvent: false },
  { id: 6, timestamp: '2026-04-07T20:01:05', type: 'email_open', brand: 'supertaste', detail: 'EDM：週末美食特搜', isKeyEvent: true },
  { id: 7, timestamp: '2026-04-07T18:45:33', type: 'page_view', brand: 'health', detail: '文章：血糖監測技巧', isKeyEvent: false },
  { id: 8, timestamp: '2026-04-07T15:10:14', type: 'video_complete', brand: 'health', detail: '看完影片：控糖運動 10 分鐘', isKeyEvent: true },
  { id: 9, timestamp: '2026-04-07T11:44:21', type: 'app_open', brand: 'health', detail: 'iOS App 開啟', isKeyEvent: true },
  { id: 10, timestamp: '2026-04-06T21:00:00', type: 'page_view', brand: 'woman', detail: '文章：春季保養趨勢', isKeyEvent: false },
  { id: 11, timestamp: '2026-04-06T18:34:41', type: 'notification_delivered', brand: 'health', detail: '推播送達：晚餐控糖提醒', isKeyEvent: true },
  { id: 12, timestamp: '2026-04-06T16:23:10', type: 'page_view', brand: 'health', detail: '文章：糖尿病外食策略', isKeyEvent: false },
  { id: 13, timestamp: '2026-04-05T19:55:54', type: 'app_open', brand: 'health', detail: 'iOS App 開啟', isKeyEvent: true },
  { id: 14, timestamp: '2026-04-05T17:12:05', type: 'page_view', brand: 'news', detail: '新聞：醫療政策更新', isKeyEvent: false },
  { id: 15, timestamp: '2026-04-04T13:20:44', type: 'email_click', brand: 'supertaste', detail: '點擊 EDM：人氣店家排行', isKeyEvent: true },
  { id: 16, timestamp: '2026-04-03T10:15:00', type: 'page_view', brand: 'health', detail: '文章：低 GI 飲食入門', isKeyEvent: false },
  { id: 17, timestamp: '2026-04-02T20:42:31', type: 'app_open', brand: 'health', detail: 'iOS App 開啟', isKeyEvent: true },
  { id: 18, timestamp: '2026-03-30T09:09:09', type: 'page_view', brand: 'health', detail: '文章：三餐控糖範例', isKeyEvent: false },
];

/** Brand display config */
export const BRAND_CONFIG: Record<string, { label: string; color: string }> = {
  health:     { label: '健康 2.0',   color: 'bg-green-100 text-green-700' },
  supertaste: { label: '食尚玩家',   color: 'bg-orange-100 text-orange-700' },
  woman:      { label: '女人我最大', color: 'bg-pink-100 text-pink-700' },
  news:       { label: 'TVBS 新聞',  color: 'bg-blue-100 text-blue-700' },
};
