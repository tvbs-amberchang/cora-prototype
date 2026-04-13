// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Layout shell combining Sidebar + Header + scrollable content area

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const routeTitles: Record<string, string> = {
  '/': '總覽儀表板',
  '/people': '用戶檔案',
  '/data': '數據追蹤',
  '/audience': '受眾區隔',
  '/delivery': '訊息遞送',
  '/journeys': '自動化旅程',
  '/campaigns': '行銷活動',
  '/settings': '系統管理',
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const title = routeTitles[location.pathname] ?? 'CORA';

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
