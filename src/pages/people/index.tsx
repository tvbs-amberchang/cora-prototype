import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  User,
  Mail,
  Phone,
  Smartphone,
  Globe,
  Clock,
  Activity,
  Tag,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Copy,
  Filter } from
'lucide-react';
type SearchType = 'email' | 'phone' | 'cora_id' | 'member_id';
type TimeRange = '24h' | '7d' | '30d';
interface SearchResult {
  id: string;
  cora_id: string;
  member_id: string | null;
  email: string;
  phone: string | null;
  lastActive: string;
  activeBrands: string[];
  reachableChannels: string[];
}
const mockResults: SearchResult[] = [
{
  id: '1',
  cora_id: 'cora_8f7d6e5c4b3a2',
  member_id: 'm_100452',
  email: 'j***@gmail.com',
  phone: '0912***789',
  lastActive: '10 分鐘前',
  activeBrands: ['health', 'supertaste'],
  reachableChannels: ['app_push', 'email']
},
{
  id: '2',
  cora_id: 'cora_2a3b4c5d6e7f8',
  member_id: null,
  email: 'j***@yahoo.com.tw',
  phone: null,
  lastActive: '2 天前',
  activeBrands: ['woman'],
  reachableChannels: ['web_push']
}];

interface TimelineEvent {
  id: number;
  timestamp: string;
  type: string;
  brand: string;
  detail: string;
  isKeyEvent: boolean;
}
const mockEvents: TimelineEvent[] = [
{
  id: 1,
  timestamp: '2026-04-08T09:30:22',
  type: 'page_view',
  brand: 'health',
  detail: '文章：糖尿病飲食指南',
  isKeyEvent: false
},
{
  id: 2,
  timestamp: '2026-04-08T09:28:15',
  type: 'app_open',
  brand: 'health',
  detail: 'iOS App 開啟',
  isKeyEvent: true
},
{
  id: 3,
  timestamp: '2026-04-08T08:40:02',
  type: 'notification_click',
  brand: 'health',
  detail: '點擊推播：本週健康重點',
  isKeyEvent: true
},
{
  id: 4,
  timestamp: '2026-04-08T07:22:11',
  type: 'video_play',
  brand: 'health',
  detail: '影片：減重迷思破解',
  isKeyEvent: false
},
{
  id: 5,
  timestamp: '2026-04-07T22:18:09',
  type: 'page_view',
  brand: 'supertaste',
  detail: '文章：台北宵夜地圖',
  isKeyEvent: false
},
{
  id: 6,
  timestamp: '2026-04-07T20:01:05',
  type: 'email_open',
  brand: 'supertaste',
  detail: 'EDM：週末美食特搜',
  isKeyEvent: true
},
{
  id: 7,
  timestamp: '2026-04-07T18:45:33',
  type: 'page_view',
  brand: 'health',
  detail: '文章：血糖監測技巧',
  isKeyEvent: false
},
{
  id: 8,
  timestamp: '2026-04-07T15:10:14',
  type: 'video_complete',
  brand: 'health',
  detail: '看完影片：控糖運動 10 分鐘',
  isKeyEvent: true
},
{
  id: 9,
  timestamp: '2026-04-07T11:44:21',
  type: 'app_open',
  brand: 'health',
  detail: 'iOS App 開啟',
  isKeyEvent: true
},
{
  id: 10,
  timestamp: '2026-04-06T21:00:00',
  type: 'page_view',
  brand: 'woman',
  detail: '文章：春季保養趨勢',
  isKeyEvent: false
},
{
  id: 11,
  timestamp: '2026-04-06T18:34:41',
  type: 'notification_delivered',
  brand: 'health',
  detail: '推播送達：晚餐控糖提醒',
  isKeyEvent: true
},
{
  id: 12,
  timestamp: '2026-04-06T16:23:10',
  type: 'page_view',
  brand: 'health',
  detail: '文章：糖尿病外食策略',
  isKeyEvent: false
},
{
  id: 13,
  timestamp: '2026-04-05T19:55:54',
  type: 'app_open',
  brand: 'health',
  detail: 'iOS App 開啟',
  isKeyEvent: true
},
{
  id: 14,
  timestamp: '2026-04-05T17:12:05',
  type: 'page_view',
  brand: 'news',
  detail: '新聞：醫療政策更新',
  isKeyEvent: false
},
{
  id: 15,
  timestamp: '2026-04-04T13:20:44',
  type: 'email_click',
  brand: 'supertaste',
  detail: '點擊 EDM：人氣店家排行',
  isKeyEvent: true
},
{
  id: 16,
  timestamp: '2026-04-03T10:15:00',
  type: 'page_view',
  brand: 'health',
  detail: '文章：低 GI 飲食入門',
  isKeyEvent: false
},
{
  id: 17,
  timestamp: '2026-04-02T20:42:31',
  type: 'app_open',
  brand: 'health',
  detail: 'iOS App 開啟',
  isKeyEvent: true
},
{
  id: 18,
  timestamp: '2026-03-30T09:09:09',
  type: 'page_view',
  brand: 'health',
  detail: '文章：三餐控糖範例',
  isKeyEvent: false
}];

const BrandBadge = ({ brand }: {brand: string;}) => {
  const config: Record<
    string,
    {
      label: string;
      color: string;
    }> =
  {
    health: {
      label: '健康 2.0',
      color: 'bg-green-100 text-green-700'
    },
    supertaste: {
      label: '食尚玩家',
      color: 'bg-orange-100 text-orange-700'
    },
    woman: {
      label: '女人我最大',
      color: 'bg-pink-100 text-pink-700'
    },
    news: {
      label: 'TVBS 新聞',
      color: 'bg-primary/10 text-primary'
    }
  };
  const { label, color } = config[brand] || {
    label: brand,
    color: 'bg-slate-100 text-slate-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>);

};
const ChannelIcon = ({
  channel,
  active = true



}: {channel: string;active?: boolean;}) => {
  const colorClass = active ? 'text-primary' : 'text-slate-300';
  switch (channel) {
    case 'email':
      return <Mail className={`w-4 h-4 ${colorClass}`} title="Email" />;
    case 'phone':
      return <Phone className={`w-4 h-4 ${colorClass}`} title="SMS" />;
    case 'app_push':
      return <Smartphone className={`w-4 h-4 ${colorClass}`} title="App Push" />;
    case 'web_push':
      return <Globe className={`w-4 h-4 ${colorClass}`} title="Web Push" />;
    default:
      return null;
  }
};
export default function PeopleView() {
  const [searchType, setSearchType] = useState<SearchType>('email');
  const [searchValue, setSearchValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(
    null
  );
  const [showFullPII, setShowFullPII] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [importantOnly, setImportantOnly] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [collapsedDateGroups, setCollapsedDateGroups] = useState<
    Record<string, boolean>
  >({});
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };
  const handleRevealPII = () => {
    if (window.confirm('揭露完整 PII 將留下稽核紀錄，確定要繼續嗎？')) {
      setShowFullPII(true);
    }
  };

  useEffect(() => {
    setVisibleCount(10);
  }, [timeRange, eventTypeFilter, brandFilter, importantOnly, selectedProfile]);

  const filteredEvents = useMemo(() => {
    const nowDate = new Date('2026-04-08T23:59:59');
    const cutoffMs =
    timeRange === '24h' ? 24 * 60 * 60 * 1000 :
    timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
    30 * 24 * 60 * 60 * 1000;
    return mockEvents.
    filter((event) => {
      const eventDate = new Date(event.timestamp);
      if (nowDate.getTime() - eventDate.getTime() > cutoffMs) return false;
      if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) return false;
      if (brandFilter !== 'all' && event.brand !== brandFilter) return false;
      if (importantOnly && !event.isKeyEvent) return false;
      return true;
    }).
    sort(
      (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [brandFilter, eventTypeFilter, importantOnly, timeRange]);

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount]
  );

  const eventTypeOptions = useMemo(
    () => Array.from(new Set(mockEvents.map((event) => event.type))).sort(),
    []
  );
  const brandOptions = useMemo(
    () => Array.from(new Set(mockEvents.map((event) => event.brand))).sort(),
    []
  );

  const groupedVisibleEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    visibleEvents.forEach((event) => {
      const dateKey = event.timestamp.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return Object.entries(groups);
  }, [visibleEvents]);

  const topEventType = useMemo(() => {
    if (filteredEvents.length === 0) return '-';
    const counter = new Map<string, number>();
    filteredEvents.forEach((event) => {
      counter.set(event.type, (counter.get(event.type) ?? 0) + 1);
    });
    return Array.from(counter.entries()).
    sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  }, [filteredEvents]);

  const topBrand = useMemo(() => {
    if (filteredEvents.length === 0) return '-';
    const counter = new Map<string, number>();
    filteredEvents.forEach((event) => {
      counter.set(event.brand, (counter.get(event.brand) ?? 0) + 1);
    });
    return Array.from(counter.entries()).
    sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  }, [filteredEvents]);
  // --- Profile Detail View ---
  if (selectedProfile) {
    return (
      <div className="p-6 md:p-8  pb-12">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedProfile(null)}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors">
            
            <ArrowLeft className="w-4 h-4" />
            <span>返回搜尋結果</span>
          </button>

          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>匯出資料 (GDPR)</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>刪除資料 (GDPR)</span>
            </button>
          </div>
        </div>

        {/* 1. 首屏：身分與聯絡方式 */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  <span>
                    {showFullPII ? 'john.doe@gmail.com' : selectedProfile.email}
                  </span>
                  {selectedProfile.member_id &&
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>已綁定會員</span>
                    </span>
                  }
                </h2>
                <div className="text-sm text-slate-500 mt-1 flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <span>cora_id:</span>
                    <code className="bg-slate-100 px-1 rounded">
                      {selectedProfile.cora_id}
                    </code>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                  {selectedProfile.member_id &&
                  <span className="flex items-center space-x-1">
                      <span>member_id:</span>
                      <code className="bg-slate-100 px-1 rounded">
                        {selectedProfile.member_id}
                      </code>
                    </span>
                  }
                </div>
              </div>
            </div>

            <button
              onClick={
              showFullPII ? () => setShowFullPII(false) : handleRevealPII
              }
              className="text-sm text-primary hover:text-primary flex items-center space-x-1 bg-primary/10 px-3 py-1.5 rounded-lg">
              
              {showFullPII ?
              <EyeOff className="w-4 h-4" /> :

              <Eye className="w-4 h-4" />
              }
              <span>{showFullPII ? '隱藏 PII' : '揭露完整 PII'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            {/* 聯絡方式與 Opt-in 狀態 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>聯絡方式與同意狀態 (Opt-in)</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 w-16">Email</span>
                    <span className="font-medium text-slate-900">
                      {showFullPII ?
                      'john.doe@gmail.com' :
                      selectedProfile.email}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    已同意 (Opt-in)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 w-16">Phone</span>
                    <span className="font-medium text-slate-900">
                      {selectedProfile.phone ?
                      showFullPII ?
                      '0912345789' :
                      selectedProfile.phone :
                      '無資料'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                    未提供
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 w-16">App Push</span>
                    <span className="font-medium text-slate-900">2 個裝置</span>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    已同意 (Opt-in)
                  </span>
                </div>
              </div>
            </div>

            {/* 渠道可達摘要 */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                <Send className="w-4 h-4 text-slate-400" />
                <span>實際可觸達渠道 (Reachable)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                綜合 Opt-in 狀態與技術可達性（如：Token 是否失效）的最終結果。
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 bg-white border border-green-200 rounded-full flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-slate-600">Email</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 bg-white border border-green-200 rounded-full flex items-center justify-center shadow-sm">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-slate-600">App Push</span>
                </div>
                <div className="flex flex-col items-center space-y-1 opacity-40 grayscale">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-600">SMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：活動摘要 & 輕診斷 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 2. 活動摘要 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>最近活動摘要</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    最近活躍時間
                  </div>
                  <div className="font-medium text-slate-900">
                    {selectedProfile.lastActive}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    最近活躍 Brand
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.activeBrands.map((brand) =>
                    <BrandBadge key={brand} brand={brand} />
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    近期行為特徵
                  </div>
                  <div className="text-sm text-slate-700">
                    高頻閱讀「健康/減重」相關文章，主要透過 iOS App 訪問。
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-sm space-y-1">
                  <div className="text-slate-600">
                    時間窗內事件：<span className="font-semibold text-slate-900">{filteredEvents.length}</span>
                  </div>
                  <div className="text-slate-600">
                    Top 事件：<span className="font-semibold text-slate-900">{topEventType}</span>
                  </div>
                  <div className="text-slate-600">
                    Top Brand：{topBrand === '-' ? <span className="font-semibold text-slate-900">-</span> : <BrandBadge brand={topBrand} />}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 輕診斷：Segment 與發送狀態 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <span>分群與發送診斷</span>
              </h3>

              <div className="mb-5">
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  目前所屬分群 (Segments)
                </div>
                <div className="space-y-2">
                  <div className="text-sm bg-slate-50 border border-slate-100 px-3 py-2 rounded-md">
                    糖尿病活躍讀者
                  </div>
                  <div className="text-sm bg-slate-50 border border-slate-100 px-3 py-2 rounded-md">
                    健康 2.0 App 活躍用戶
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  最近發送紀錄
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        健康週報 EDM
                      </div>
                      <div className="text-xs text-slate-500">
                        2026-04-06 10:00 · 成功送達
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        女大週年慶 SMS
                      </div>
                      <div className="text-xs text-slate-500 mb-1">
                        2026-04-05 15:30 · 發送跳過
                      </div>
                      <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded inline-block">
                        原因：無有效手機號碼
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：完整事件時間線 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span>完整事件時間線 (Data Core)</span>
                </h3>
                <div className="text-xs text-slate-500">
                  顯示 {visibleEvents.length} / {filteredEvents.length} 筆
                </div>
              </div>
              <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="px-3 py-2 border border-border rounded text-sm">
                  <option value="24h">近 24 小時</option>
                  <option value="7d">近 7 天</option>
                  <option value="30d">近 30 天</option>
                </select>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded text-sm">
                  <option value="all">全部事件類型</option>
                  {eventTypeOptions.map((type) =>
                  <option key={type} value={type}>
                      {type}
                    </option>
                  )}
                </select>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded text-sm">
                  <option value="all">全部 Brand</option>
                  {brandOptions.map((brand) =>
                  <option key={brand} value={brand}>
                      {brand}
                    </option>
                  )}
                </select>
                <label className="md:col-span-2 flex items-center justify-between border border-border rounded px-3 py-2 text-sm text-slate-700">
                  <span className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>僅看關鍵事件</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={importantOnly}
                    onChange={(e) => setImportantOnly(e.target.checked)}
                  />
                </label>
              </div>

              {groupedVisibleEvents.length === 0 &&
              <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  這個時間窗沒有符合條件的事件，請調整篩選條件。
                </div>
              }

              {groupedVisibleEvents.length > 0 &&
              <div className="space-y-5 pb-4">
                  {groupedVisibleEvents.map(([dateKey, events]) =>
                <div key={dateKey} className="border border-slate-200 rounded-lg p-3">
                      <button
                    onClick={() =>
                    setCollapsedDateGroups((prev) => ({
                      ...prev,
                      [dateKey]: !prev[dateKey]
                    }))
                    }
                    className="w-full flex items-center justify-between text-left">
                        <span className="text-sm font-semibold text-slate-800">
                          {dateKey}（{events.length} 筆）
                        </span>
                        <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform ${collapsedDateGroups[dateKey] ? '' : 'rotate-90'}`} />
                    
                      </button>
                      {!collapsedDateGroups[dateKey] &&
                  <div className="relative border-l-2 border-slate-100 ml-2 mt-3 space-y-5">
                          {events.map((event) =>
                    <div key={event.id} className="relative pl-5">
                              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-primary"></div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-semibold text-slate-900">
                                  {event.type}
                                </span>
                                <BrandBadge brand={event.brand} />
                                {event.isKeyEvent &&
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                    key
                                  </span>
                          }
                              </div>
                              <div className="text-sm text-slate-700 mb-1">
                                {event.detail}
                              </div>
                              <div className="text-xs text-slate-400">
                                {event.timestamp.replace('T', ' ')}
                              </div>
                            </div>
                    )}
                        </div>
                  }
                    </div>
                )}
                </div>
              }

              {visibleCount < filteredEvents.length &&
              <div className="pt-3">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="text-sm text-primary hover:text-primary font-medium">
                    載入更多事件（+10）
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>);

  }
  // --- Search View ---
  return (
    <div className="p-6 md:p-8 ">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">用戶檔案</h1>
        <p className="text-slate-500 text-lg">
          輸入識別符，快速查詢用戶全貌與診斷發送狀態
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative border-r border-slate-200">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="appearance-none bg-transparent pl-4 pr-10 py-3 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer">
              
              <option value="email">Email</option>
              <option value="phone">手機號碼 (Phone)</option>
              <option value="cora_id">CORA ID</option>
              <option value="member_id">會員 ID (Member ID)</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7">
                </path>
              </svg>
            </div>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
              searchType === 'email' ?
              '輸入完整或部分 Email...' :
              searchType === 'phone' ?
              '輸入完整或部分手機號碼...' :
              '輸入完整精準的 ID...'
              }
              className="w-full pl-12 pr-4 py-3 text-base focus:outline-none bg-transparent" />
            
          </div>

          <button
            type="submit"
            disabled={!searchValue.trim() || isSearching}
            className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            
            {isSearching ?
            <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>搜尋中...</span>
              </> :

            <span>搜尋</span>
            }
          </button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched &&
      <div>
          <h3 className="text-sm font-medium text-slate-500 mb-4 px-1">
            搜尋結果 ({mockResults.length} 筆)
          </h3>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">主要識別 (遮罩)</th>
                  <th className="px-6 py-3 font-medium">CORA ID / 會員狀態</th>
                  <th className="px-6 py-3 font-medium">最近活躍</th>
                  <th className="px-6 py-3 font-medium">可觸達渠道</th>
                  <th className="px-6 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockResults.map((result) =>
              <tr
                key={result.id}
                className="hover:bg-slate-50 transition-colors group">
                
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {result.email}
                      </div>
                      {result.phone &&
                  <div className="text-slate-500 text-xs mt-0.5">
                          {result.phone}
                        </div>
                  }
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-600 mb-1">
                        {result.cora_id}
                      </div>
                      {result.member_id ?
                  <span className="inline-flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>已綁定</span>
                        </span> :

                  <span className="inline-flex items-center space-x-1 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          <span>匿名訪客</span>
                        </span>
                  }
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 mb-1">
                        {result.lastActive}
                      </div>
                      <div className="flex gap-1">
                        {result.activeBrands.map((brand) =>
                    <BrandBadge key={brand} brand={brand} />
                    )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ChannelIcon
                      channel="email"
                      active={result.reachableChannels.includes('email')} />
                    
                        <ChannelIcon
                      channel="phone"
                      active={result.reachableChannels.includes('phone')} />
                    
                        <ChannelIcon
                      channel="app_push"
                      active={result.reachableChannels.includes('app_push')} />
                    
                        <ChannelIcon
                      channel="web_push"
                      active={result.reachableChannels.includes('web_push')} />
                    
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                    onClick={() => setSelectedProfile(result)}
                    className="text-primary hover:text-blue-800 font-medium flex items-center justify-end space-x-1 w-full">
                    
                        <span>檢視詳情</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-primary/10 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">找不到你要的人？</p>
              <p className="text-primary">
                請確認輸入的識別符是否正確，或嘗試切換不同的查詢類型（例如改用手機號碼搜尋）。
              </p>
            </div>
          </div>
        </div>
      }
    </div>);

}