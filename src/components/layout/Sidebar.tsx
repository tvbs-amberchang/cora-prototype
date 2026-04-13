// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: PostHog-style light sidebar with grouped navigation, collapsible

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Database,
  Users,
  Send,
  Workflow,
  Megaphone,
  Settings,
  Search,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

const insightsItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: User, label: 'People', to: '/people' },
  { icon: Database, label: 'Events', to: '/data' },
];

const actionItems: NavItem[] = [
  { icon: Users, label: 'Cohorts', to: '/audience' },
  { icon: Send, label: 'Delivery', to: '/delivery' },
  { icon: Workflow, label: 'Journeys', to: '/journeys' },
  { icon: Megaphone, label: 'Campaigns', to: '/campaigns' },
];

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

const SidebarNavItem = ({ item, isActive, collapsed }: SidebarNavItemProps) => {
  const Icon = item.icon;

  const content = (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors duration-150',
        collapsed ? 'justify-center px-2' : '',
        isActive
          ? 'bg-sidebar-active text-ph-text font-medium'
          : 'text-ph-secondary hover:bg-sidebar-hover'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('TVBS 全集團');

  const brands = ['TVBS 全集團', '女人我最大', '健康 2.0', '食尚玩家', 'TVBS 新聞'];

  const isActive = (to: string) => location.pathname === to;

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-30 flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-200',
          collapsed ? 'w-[60px]' : 'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 px-3 py-3 h-14', collapsed && 'justify-center px-2')}>
          <div className="w-7 h-7 bg-ph-blue rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm leading-none">C</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-ph-text text-base tracking-tight">CORA</span>
          )}
          {/* Mobile close button */}
          <button
            className="md:hidden ml-auto text-ph-secondary hover:text-ph-text"
            onClick={onMobileClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-sidebar-border bg-white text-ph-muted text-sm cursor-default">
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Search...</span>
              <span className="ml-auto text-xs bg-sidebar-hover px-1 rounded">⌘K</span>
            </div>
          </div>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 pb-2">
                <div className="flex items-center justify-center p-1.5 rounded-md border border-sidebar-border bg-white text-ph-muted cursor-default">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Search (⌘K)</TooltipContent>
          </Tooltip>
        )}

        <Separator className="mb-2" />

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* INSIGHTS group */}
          <div>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold text-ph-muted uppercase tracking-wider">
                Insights
              </div>
            )}
            <div className="space-y-0.5">
              {insightsItems.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  isActive={isActive(item.to)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>

          {/* ACTION group */}
          <div>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold text-ph-muted uppercase tracking-wider">
                Action
              </div>
            )}
            <div className="space-y-0.5">
              {actionItems.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  isActive={isActive(item.to)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-2 pb-2 space-y-1">
          {/* Settings */}
          <SidebarNavItem
            item={{ icon: Settings, label: 'Settings', to: '/settings' }}
            isActive={isActive('/settings')}
            collapsed={collapsed}
          />

          <Separator className="my-1" />

          {/* User + brand selector */}
          {!collapsed && (
            <div className="relative">
              <button
                onClick={() => setBrandMenuOpen((prev) => !prev)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-hover text-sm transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-ph-blue flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  AC
                </div>
                <span className="flex-1 text-left text-ph-text truncate">Amber Chang</span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-ph-muted transition-transform', brandMenuOpen && 'rotate-180')} />
              </button>
              {brandMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setBrandMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-sidebar-border rounded-md shadow-card-hover py-1 z-30">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-sm transition-colors',
                          selectedBrand === brand
                            ? 'bg-sidebar-active text-ph-text font-medium'
                            : 'text-ph-secondary hover:bg-sidebar-hover'
                        )}
                        onClick={() => { setSelectedBrand(brand); setBrandMenuOpen(false); }}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-1">
                  <div className="w-6 h-6 rounded-full bg-ph-blue flex items-center justify-center text-white text-xs font-semibold cursor-default">
                    AC
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Amber Chang</TooltipContent>
            </Tooltip>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-ph-muted hover:bg-sidebar-hover hover:text-ph-secondary text-sm transition-colors',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
