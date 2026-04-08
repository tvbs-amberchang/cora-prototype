import React, { useState, Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation } from
'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  Megaphone,
  Send,
  Workflow,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X } from
'lucide-react';
import AudiencePage from './pages/Audience';
import PeopleViewPage from './pages/PeopleView';
import JourneysPage from './pages/Journeys';
import CampaignsPage from './pages/Campaigns';
import DeliveryPage from './pages/Delivery';
import DataCorePage from './pages/DataCore';
import SystemAdminPage from './pages/SystemAdmin';
// --- Components ---
const SidebarItem = ({
  icon: Icon,
  label,
  to,
  isActive





}: {icon: any;label: string;to: string;isActive: boolean;}) =>
<Link
  to={to}
  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
  
    <Icon
    className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
  
    <span>{label}</span>
  </Link>;

const Topbar = () => {
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('TVBS 全集團');
  const currentUser = {
    name: 'Amber Chang',
    role: 'System Admin',
    brands: ['health', 'supertaste', 'woman'],
    hasAllBrands: true
  };
  const notifications = [
  {
    id: 'n1',
    title: 'SMS 主要供應商切換為備援',
    time: '2 分鐘前'
  },
  {
    id: 'n2',
    title: 'LINE 預算已達 72%',
    time: '15 分鐘前'
  },
  {
    id: 'n3',
    title: 'GDPR 刪除請求 g2 進入執行中',
    time: '34 分鐘前'
  }];
  const brands = [
  'TVBS 全集團',
  '女人我最大',
  '健康 2.0',
  '食尚玩家',
  'TVBS 新聞'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        {/* Brand Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBrandOpen(!isBrandOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-slate-50 border border-slate-200 transition-colors">
            
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              {selectedBrand.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {selectedBrand}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isBrandOpen &&
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-20">
              {brands.map((brand) =>
            <button
              key={brand}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSelectedBrand(brand);
                setIsBrandOpen(false);
              }}>
              
                  {brand}
                </button>
            )}
            </div>
          }
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋用戶、活動或標籤..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-64 transition-all" />
          
        </div>
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          {isNotificationOpen &&
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-30">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">最近通知</span>
                <span className="text-xs text-slate-500">近 3 筆</span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((item) =>
              <div key={item.id} className="px-4 py-3">
                    <div className="text-sm text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.time}</div>
                  </div>
              )}
              </div>
            </div>
          }
        </div>
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm cursor-pointer">
          </button>
          {isProfileOpen &&
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-30">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-slate-500 mt-1">角色：{currentUser.role}</div>
              </div>
              <div className="px-4 py-3 text-sm">
                <div className="text-xs text-slate-500 mb-2">品牌權限</div>
                {currentUser.hasAllBrands ?
                <div className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs border border-green-200">
                    全品牌權限（all brands）
                  </div> :
                <div className="flex flex-wrap gap-2">
                    {currentUser.brands.map((brand) =>
                  <span key={brand} className="px-2 py-1 rounded bg-slate-50 text-slate-700 text-xs border border-slate-200 font-mono">
                        {brand}
                      </span>
                  )}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </header>);

};
const Layout = ({ children }: {children: React.ReactNode;}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
  {
    icon: LayoutDashboard,
    label: '總覽儀表板',
    to: '/'
  },
  {
    icon: Search,
    label: '用戶檔案',
    to: '/people'
  },
  {
    icon: Users,
    label: '受眾區隔',
    to: '/audience'
  },
  {
    icon: Megaphone,
    label: '行銷活動',
    to: '/campaigns'
  },
  {
    icon: Workflow,
    label: '自動化旅程',
    to: '/journeys'
  },
  {
    icon: Send,
    label: '訊息遞送',
    to: '/delivery'
  },
  {
    icon: Database,
    label: '數據追蹤',
    to: '/data'
  },
  {
    icon: Settings,
    label: '系統管理',
    to: '/settings'
  }];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen &&
      <div
        className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
        onClick={() => setIsMobileMenuOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between md:justify-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">
                C
              </span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              CORA
            </span>
          </div>
          <button
            className="md:hidden text-slate-500"
            onClick={() => setIsMobileMenuOpen(false)}>
            
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            核心模組
          </div>
          {navItems.map((item) =>
          <SidebarItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={location.pathname === item.to} />

          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">系統狀態</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-700">API 正常運作中</span>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between h-16 bg-white border-b border-slate-200 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-500">
            
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900">CORA</span>
          <div className="w-6 h-6"></div>
        </div>

        <Topbar />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>);

};
// --- Page Placeholders ---
const PageHeader = ({
  title,
  description



}: {title: string;description: string;}) =>
<div className="mb-8">
    <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
    <p className="text-slate-500">{description}</p>
  </div>;

const PlaceholderCard = ({
  title,
  children



}: {title: string;children?: React.ReactNode;}) =>
<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    {children ||
  <div className="h-48 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">
          此頁面功能建置中... (等待詳細 PRD)
        </p>
      </div>
  }
  </div>;

// Pages
const Dashboard = () =>
<div>
    <PageHeader title="總覽儀表板" description="全站數據與行銷活動概況" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs text-slate-500">ID 覆蓋率</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">96.4%</div>
        <div className="text-xs text-green-600 mt-1">目標 95%（達標）</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs text-slate-500">事件入庫延遲 P95</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">3.2s</div>
        <div className="text-xs text-green-600 mt-1">Data Core 目標 &lt; 5s</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs text-slate-500">今日活躍分群</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">128</div>
        <div className="text-xs text-slate-500 mt-1">含 23 個即時更新分群</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs text-slate-500">進行中旅程</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">17</div>
        <div className="text-xs text-slate-500 mt-1">啟用上限 50</div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">遞送與活動成效（近 24h）</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            發送任務
            <div className="text-xl font-bold text-slate-900 mt-1">42</div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            平均送達率
            <div className="text-xl font-bold text-slate-900 mt-1">97.1%</div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            平均點擊率
            <div className="text-xl font-bold text-slate-900 mt-1">6.8%</div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            問卷完成數
            <div className="text-xl font-bold text-slate-900 mt-1">5,204</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          渠道拆分：Push 18｜LINE 9｜SMS 6｜Email 9
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">預算使用率（月）</h3>
        <div className="space-y-3 text-sm">
          <div>
            <div className="flex justify-between mb-1"><span>SMS</span><span className="font-mono">64%</span></div>
            <div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: '64%' }}></div></div>
          </div>
          <div>
            <div className="flex justify-between mb-1"><span>LINE</span><span className="font-mono">72%</span></div>
            <div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-emerald-500 rounded" style={{ width: '72%' }}></div></div>
          </div>
          <div>
            <div className="flex justify-between mb-1"><span>Email</span><span className="font-mono">24%</span></div>
            <div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-amber-500 rounded" style={{ width: '24%' }}></div></div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">系統告警與待處理事項</h3>
      <div className="space-y-2 text-sm">
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-3 py-2">SMS 主要供應商連續失敗，已切換備援（2 分鐘前）</div>
        <div className="border border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-3 py-2">LINE 預算達 72%，接近提醒門檻（80%）</div>
        <div className="border border-slate-200 bg-slate-50 text-slate-700 rounded-lg px-3 py-2">本日有 3 筆 GDPR Request 仍在處理中</div>
      </div>
    </div>
  </div>;

const Campaigns = () =>
<div>
    <PageHeader
    title="行銷活動"
    description="建立 Inline 模組、問卷、抽獎等互動活動" />
  
    <PlaceholderCard title="活動列表" />
  </div>;

const Journeys = () =>
<div>
    <PageHeader title="自動化旅程" description="視覺化編排用戶行銷旅程" />
    <PlaceholderCard title="旅程畫布列表" />
  </div>;

export function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/audience" element={<AudiencePage />} />
          <Route path="/people" element={<PeopleViewPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/journeys" element={<JourneysPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/data" element={<DataCorePage />} />
          <Route path="/settings" element={<SystemAdminPage />} />
        </Routes>
      </Layout>
    </Router>);

}