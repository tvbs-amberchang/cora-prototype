// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Simplified page header with breadcrumb, notifications dropdown, and user avatar

import React, { useState } from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const notifications = [
  { id: 'n1', title: 'SMS 主要供應商切換為備援', time: '2 分鐘前', severity: 'error' as const },
  { id: 'n2', title: 'LINE 預算已達 72%', time: '15 分鐘前', severity: 'warning' as const },
  { id: 'n3', title: 'GDPR 刪除請求 g2 進入執行中', time: '34 分鐘前', severity: 'info' as const },
];

const severityIcon = {
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-ph-blue" />,
};

interface HeaderProps {
  title: string;
  onMobileMenuOpen: () => void;
}

export const Header = ({ title, onMobileMenuOpen }: HeaderProps) => {
  return (
    <header className="h-14 bg-white border-b border-sidebar-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-ph-secondary hover:text-ph-text transition-colors"
          onClick={onMobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-ph-text">{title}</h1>
      </div>

      {/* Right: notifications + user avatar */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-md text-ph-secondary hover:bg-sidebar-hover hover:text-ph-text transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-3 py-2.5 border-b border-sidebar-border flex items-center justify-between">
              <span className="text-sm font-semibold text-ph-text">通知</span>
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                3 則未讀
              </span>
            </div>
            <div className="divide-y divide-sidebar-border">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2.5 hover:bg-sidebar-hover transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">{severityIcon[item.severity]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ph-text">{item.title}</div>
                      <div className="text-xs text-ph-muted mt-0.5">{item.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md hover:bg-sidebar-hover transition-colors">
              <div className="w-7 h-7 rounded-full bg-ph-blue flex items-center justify-center text-white text-xs font-semibold">
                AC
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1">
            <div className="px-2 py-2">
              <div className="text-sm font-medium text-ph-text">Amber Chang</div>
              <div className="text-xs text-ph-muted mt-0.5">System Admin</div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
