import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
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
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
} from 'lucide-react';
import AudiencePage from './pages/Audience';
import PeopleViewPage from './pages/PeopleView';
import JourneysPage from './pages/Journeys';
import CampaignsPage from './pages/Campaigns';
import DeliveryPage from './pages/Delivery';
import DataCorePage from './pages/DataCore';
import SystemAdminPage from './pages/SystemAdmin';

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  isActive,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-brand-200/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
          : 'text-brand-300/60 group-hover:text-white'
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
    </div>
    <span className="text-sm">{label}</span>
    {isActive && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />
    )}
  </Link>
);

const Topbar = () => {
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('TVBS 全集團');

  const currentUser = {
    name: 'Amber Chang',
    role: 'System Admin',
    brands: ['health', 'supertaste', 'woman'],
    hasAllBrands: true,
  };

  const notifications = [
    { id: 'n1', title: 'SMS 主要供應商切換為備援', time: '2 分鐘前', severity: 'error' as const },
    { id: 'n2', title: 'LINE 預算已達 72%', time: '15 分鐘前', severity: 'warning' as const },
    { id: 'n3', title: 'GDPR 刪除請求 g2 進入執行中', time: '34 分鐘前', severity: 'info' as const },
  ];

  const brands = ['TVBS 全集團', '女人我最大', '健康 2.0', '食尚玩家', 'TVBS 新聞'];

  const severityIcon = {
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-brand-500" />,
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setIsBrandOpen(!isBrandOpen)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all duration-200 cursor-pointer"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {selectedBrand.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">{selectedBrand}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isBrandOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBrandOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsBrandOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      selectedBrand === brand
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => { setSelectedBrand(brand); setIsBrandOpen(false); }}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋用戶、活動或標籤..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 focus:bg-white w-72 transition-all duration-200"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg relative transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsNotificationOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-sm font-semibold text-slate-900">通知</span>
                  <span className="badge bg-red-100 text-red-700">3 則未讀</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div key={item.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">{severityIcon[item.severity]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-800">{item.title}</div>
                          <div className="text-xs text-slate-400 mt-1">{item.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              AC
            </div>
          </button>
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                <div className="px-4 py-4 bg-gradient-to-br from-brand-500 to-brand-700">
                  <div className="text-white font-semibold">{currentUser.name}</div>
                  <div className="text-brand-200 text-sm mt-0.5">{currentUser.role}</div>
                </div>
                <div className="px-4 py-3 text-sm">
                  <div className="text-xs text-slate-500 mb-2">品牌權限</div>
                  {currentUser.hasAllBrands ? (
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                      全品牌權限
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentUser.brands.map((brand) => (
                        <span key={brand} className="badge bg-slate-100 text-slate-700 font-mono">
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: '總覽儀表板', to: '/' },
    { icon: Search, label: '用戶檔案', to: '/people' },
    { icon: Users, label: '受眾區隔', to: '/audience' },
    { icon: Megaphone, label: '行銷活動', to: '/campaigns' },
    { icon: Workflow, label: '自動化旅程', to: '/journeys' },
    { icon: Send, label: '訊息遞送', to: '/delivery' },
    { icon: Database, label: '數據追蹤', to: '/data' },
    { icon: Settings, label: '系統管理', to: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden font-sans">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-brand-900 flex flex-col transition-transform duration-300 ease-in-out shadow-sidebar
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-5 justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-bold text-lg leading-none">C</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">CORA</span>
              <div className="text-[10px] text-brand-300/50 tracking-wider uppercase">Platform</div>
            </div>
          </div>
          <button className="md:hidden text-brand-300" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-3 text-[10px] font-semibold text-brand-400/40 uppercase tracking-[0.15em]">
            核心模組
          </div>
          {navItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>

        <div className="p-4">
          <div className="bg-white/5 backdrop-blur rounded-xl p-3.5 border border-white/5">
            <p className="text-[10px] font-medium text-brand-300/50 uppercase tracking-wider mb-2">
              系統狀態
            </p>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full absolute inset-0 animate-ping opacity-30" />
              </div>
              <span className="text-sm text-brand-200/70">API 正常運作中</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between h-16 bg-white border-b border-slate-200 px-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500 cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900">CORA</span>
          <div className="w-6 h-6" />
        </div>
        <Topbar />
        <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
      </main>
    </div>
  );
};

const PageHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{title}</h1>
    <p className="text-slate-500 text-sm">{description}</p>
  </div>
);

const PlaceholderCard = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    {children || (
      <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50">
        <p className="text-slate-400 text-sm">此頁面功能建置中... (等待詳細 PRD)</p>
      </div>
    )}
  </div>
);

const KpiCard = ({
  label,
  value,
  sub,
  trend,
  color = 'brand',
}: {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'brand' | 'emerald' | 'amber' | 'violet';
}) => {
  const colorMap = {
    brand: 'from-brand-500 to-brand-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
  };
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="kpi-card group hover:shadow-card-hover transition-all duration-250">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {trend && (
          <span className={`flex items-center space-x-0.5 ${trendColor}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>{sub}</div>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]} rounded-t-xl`} />
    </div>
  );
};

const ProgressBar = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const AlertItem = ({
  message,
  severity,
}: {
  message: string;
  severity: 'error' | 'warning' | 'info';
}) => {
  const config = {
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
      border: 'border-l-red-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
      border: 'border-l-amber-500',
    },
    info: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-600',
      icon: <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />,
      border: 'border-l-slate-400',
    },
  };
  const c = config[severity];
  return (
    <div className={`flex items-center space-x-3 rounded-lg border border-l-4 ${c.border} ${c.bg} px-4 py-3 ${c.text}`}>
      {c.icon}
      <span className="text-sm">{message}</span>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
    <PageHeader title="總覽儀表板" description="全站數據與行銷活動概況" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard label="ID 覆蓋率" value="96.4%" sub="目標 95%（達標）" trend="up" color="brand" />
      <KpiCard label="事件入庫延遲 P95" value="3.2s" sub="Data Core 目標 < 5s" trend="up" color="emerald" />
      <KpiCard label="今日活躍分群" value="128" sub="含 23 個即時更新分群" trend="neutral" color="violet" />
      <KpiCard label="進行中旅程" value="17" sub="啟用上限 50" trend="neutral" color="amber" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">遞送與活動成效</h3>
          <span className="badge bg-brand-50 text-brand-600">近 24h</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: '發送任務', value: '42', icon: Send },
            { label: '平均送達率', value: '97.1%', icon: TrendingUp },
            { label: '平均點擊率', value: '6.8%', icon: Zap },
            { label: '問卷完成數', value: '5,204', icon: Activity },
          ].map((item) => (
            <div key={item.label} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 group hover:bg-brand-50/50 hover:border-brand-200 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-2">
                <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                <span className="text-slate-500 text-xs">{item.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
          渠道拆分：Push 18 ｜ LINE 9 ｜ SMS 6 ｜ Email 9
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">預算使用率</h3>
          <span className="badge bg-slate-100 text-slate-600">本月</span>
        </div>
        <div className="space-y-5">
          <ProgressBar label="SMS" value={64} color="bg-gradient-to-r from-brand-400 to-brand-600" />
          <ProgressBar label="LINE" value={72} color="bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <ProgressBar label="Email" value={24} color="bg-gradient-to-r from-amber-400 to-amber-500" />
        </div>
      </div>
    </div>

    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-slate-900">系統告警與待處理事項</h3>
        <span className="badge bg-red-50 text-red-600 border border-red-200">3 則待處理</span>
      </div>
      <div className="space-y-3">
        <AlertItem severity="error" message="SMS 主要供應商連續失敗，已切換備援（2 分鐘前）" />
        <AlertItem severity="warning" message="LINE 預算達 72%，接近提醒門檻（80%）" />
        <AlertItem severity="info" message="本日有 3 筆 GDPR Request 仍在處理中" />
      </div>
    </div>
  </div>
);

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
    </Router>
  );
}
