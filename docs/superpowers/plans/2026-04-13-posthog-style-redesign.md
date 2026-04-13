# PostHog Style Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform CORA prototype from Webflow dark-sidebar design to PostHog-style light, neutral UI using shadcn/ui components.

**Architecture:** Incremental replacement — install shadcn/ui foundation first, rebuild the global Layout (sidebar + header), then convert each page from simplest to most complex. Each page gets split into sub-components (target < 300 lines per file). No business logic or mock data changes.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind CSS 3, shadcn/ui (Radix UI), Lucide icons (already installed), React Router 6 (no change), @xyflow/react (no change).

**Spec:** `docs/superpowers/specs/2026-04-13-posthog-style-redesign.md`

---

## File Structure (Target)

```
src/
├── components/
│   ├── ui/                    ← shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── tooltip.tsx
│   │   └── alert.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx        ← new light sidebar with groups
│   │   ├── Header.tsx         ← simplified header
│   │   └── Layout.tsx         ← shell combining sidebar + header + content
│   └── shared/
│       ├── PageHeader.tsx     ← extracted from App.tsx
│       └── EmptyState.tsx     ← new reusable empty state
├── lib/
│   └── utils.ts               ← cn() helper for shadcn/ui
├── pages/
│   ├── dashboard/
│   │   ├── index.tsx
│   │   ├── KpiCard.tsx
│   │   └── AlertsSection.tsx
│   ├── data/
│   │   ├── index.tsx
│   │   ├── EventCatalog.tsx
│   │   └── QueryBuilder.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── RbacTab.tsx
│   │   ├── ChannelsTab.tsx
│   │   ├── BudgetTab.tsx
│   │   ├── AuditTab.tsx
│   │   ├── NotifyTab.tsx
│   │   └── GdprTab.tsx
│   ├── campaigns/
│   │   ├── index.tsx
│   │   └── CampaignList.tsx
│   ├── delivery/
│   │   ├── index.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskEditor.tsx
│   ├── people/
│   │   ├── index.tsx
│   │   ├── SearchResults.tsx
│   │   ├── UserDetail.tsx
│   │   └── Timeline.tsx
│   ├── audience/
│   │   ├── index.tsx
│   │   ├── SegmentList.tsx
│   │   ├── SegmentEditor.tsx
│   │   └── ConditionBuilder.tsx
│   └── journeys/
│       ├── index.tsx
│       ├── JourneyList.tsx
│       └── JourneyCanvas.tsx  ← React Flow canvas, minimal changes
├── App.tsx                    ← slim: Router + Layout + Routes only
├── index.css
└── index.tsx
```

---

## Task 1: Install shadcn/ui and Configure Foundation

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json` (add path alias)
- Modify: `vite.config.ts` (add path alias)
- Modify: `tailwind.config.js` (new PostHog tokens + shadcn/ui vars)
- Modify: `src/index.css` (replace Webflow classes with shadcn/ui base)
- Create: `src/lib/utils.ts`
- Create: `components.json` (shadcn/ui config)

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/amberchang/Desktop/cora-prototype
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
```

- [ ] **Step 2: Add path alias to tsconfig.json**

Add `baseUrl` and `paths` to `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 3: Add path alias to vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/cora-prototype/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Create shadcn/ui config file `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 5: Create `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Update `tailwind.config.js` with PostHog tokens**

Replace the entire file with new design tokens. Key changes:
- Remove Webflow colors (brand, accent, surface, wf)
- Add CSS variable-based colors for shadcn/ui
- Add PostHog-inspired palette
- Replace Webflow shadows with minimal shadows
- Replace WF Visual Sans with Inter
- Add `tailwindcss-animate` plugin

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    screens: {
      sm: '479px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          bg: '#fafaf9',
          border: '#e5e5e5',
          hover: '#e8e8e6',
          active: '#e8e8e6',
          muted: '#999999',
        },
        ph: {
          blue: '#1d4aff',
          text: '#1d1f27',
          secondary: '#5e5e5e',
          muted: '#999999',
          surface: '#f3f4f6',
          success: '#36b37e',
          warning: '#f5a623',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 2px 8px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

- [ ] **Step 7: Update `src/index.css`**

Replace the entire file. Key changes:
- Add CSS variables for shadcn/ui (PostHog-inspired values)
- Remove Webflow component classes (.card, .kpi-card, .btn-primary, etc.)
- Keep Inter + Noto Sans TC font imports

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 228 12% 13%;
    --card: 0 0% 100%;
    --card-foreground: 228 12% 13%;
    --popover: 0 0% 100%;
    --popover-foreground: 228 12% 13%;
    --primary: 231 100% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 5% 96%;
    --secondary-foreground: 228 12% 13%;
    --muted: 220 5% 96%;
    --muted-foreground: 0 0% 60%;
    --accent: 220 5% 93%;
    --accent-foreground: 228 12% 13%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 231 100% 55%;
    --radius: 0.375rem;
  }

  body {
    @apply antialiased text-foreground bg-background;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }

  ::selection {
    @apply bg-primary/10 text-primary;
  }
}
```

- [ ] **Step 8: Install shadcn/ui components**

```bash
cd /Users/amberchang/Desktop/cora-prototype
npx shadcn@latest add button badge card input table tabs dialog dropdown-menu select separator skeleton tooltip alert
```

If the CLI asks questions, answer:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 9: Verify build**

```bash
cd /Users/amberchang/Desktop/cora-prototype && npm run build
```

Expected: Build succeeds (pages still use old classes but that's OK — they'll be updated in later tasks).

- [ ] **Step 10: Commit**

```bash
cd /Users/amberchang/Desktop/cora-prototype
git add -A
git commit -m "[AI-DEV] chore: install shadcn/ui + PostHog design tokens

- Install shadcn/ui dependencies (cva, clsx, tailwind-merge, tailwindcss-animate)
- Add path alias (@/) to tsconfig + vite config
- Replace Webflow design tokens with PostHog-inspired palette
- Replace Webflow component classes with shadcn/ui CSS variables
- Add 13 shadcn/ui components (button, badge, card, table, tabs, etc.)
- AI-assisted development, review notes: foundation only, no page changes yet"
```

---

## Task 2: Rebuild Layout (Sidebar + Header)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/shared/PageHeader.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Modify: `src/App.tsx` (slim down to Router + Routes only)

- [ ] **Step 1: Create `src/components/shared/PageHeader.tsx`**

Extract from App.tsx and update styling:

```tsx
export const PageHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-semibold text-ph-text tracking-tight mb-1">{title}</h1>
    <p className="text-ph-secondary text-sm">{description}</p>
  </div>
);
```

- [ ] **Step 2: Create `src/components/shared/EmptyState.tsx`**

```tsx
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = ({
  title = '沒有找到符合條件的結果',
  description = '試試調整篩選條件',
  onReset,
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Inbox className="w-12 h-12 text-ph-muted mb-4" />
    <h3 className="text-sm font-medium text-ph-text mb-1">{title}</h3>
    <p className="text-sm text-ph-muted mb-4">{description}</p>
    {onReset && (
      <Button variant="outline" size="sm" onClick={onReset}>
        重設篩選
      </Button>
    )}
  </div>
);
```

- [ ] **Step 3: Create `src/components/layout/Sidebar.tsx`**

Build the new PostHog-style light sidebar with grouped navigation. Key features:
- Light background (#fafaf9)
- Search box at top
- INSIGHTS group: Dashboard, People, Events
- ACTION group: Cohorts, Delivery, Journeys, Campaigns
- Settings at bottom (ungrouped)
- User info + brand selector at bottom
- Collapsible (240px → 60px)
- Mobile overlay support

```tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  Megaphone,
  Send,
  Workflow,
  Settings,
  Search,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  User,
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

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Insights',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
      { icon: User, label: 'People', to: '/people' },
      { icon: Database, label: 'Events', to: '/data' },
    ],
  },
  {
    title: 'Action',
    items: [
      { icon: Users, label: 'Cohorts', to: '/audience' },
      { icon: Send, label: 'Delivery', to: '/delivery' },
      { icon: Workflow, label: 'Journeys', to: '/journeys' },
      { icon: Megaphone, label: 'Campaigns', to: '/campaigns' },
    ],
  },
];

const SidebarLink = ({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) => {
  const Icon = item.icon;
  const link = (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-sidebar-active text-ph-text font-medium'
          : 'text-ph-secondary hover:bg-sidebar-hover hover:text-ph-text',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

export const Sidebar = ({
  isMobileOpen,
  onMobileClose,
}: {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('全部品牌');

  const brands = ['全部品牌', '女人我最大', '健康 2.0', '食尚玩家', 'TVBS 新聞'];

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-30 flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-200',
          collapsed ? 'w-[60px]' : 'w-[240px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-14 flex items-center px-3 shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-ph-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
              C
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-ph-text">CORA</span>
            )}
          </Link>
          <button className="md:hidden text-ph-secondary" onClick={onMobileClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-sidebar-border rounded-md text-ph-muted text-xs cursor-pointer hover:border-ph-secondary transition-colors">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-auto text-[10px] bg-sidebar-bg border border-sidebar-border rounded px-1">⌘K</kbd>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="px-3 mb-2 flex justify-center">
            <button className="p-1.5 text-ph-muted hover:text-ph-secondary rounded-md hover:bg-sidebar-hover transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="text-[10px] font-semibold text-ph-muted uppercase tracking-wider px-2.5 mb-1">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.to}
                    item={item}
                    isActive={location.pathname === item.to}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-3 space-y-1 shrink-0">
          <SidebarLink
            item={{ icon: Settings, label: 'Settings', to: '/settings' }}
            isActive={location.pathname === '/settings'}
            collapsed={collapsed}
          />

          <Separator className="my-2" />

          {/* User + Brand */}
          <div className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-md',
            collapsed && 'justify-center px-0'
          )}>
            <div className="w-7 h-7 rounded-full bg-ph-blue flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
              AC
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-ph-text truncate">Amber Chang</div>
                <div className="relative">
                  <button
                    onClick={() => setBrandMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] text-ph-muted hover:text-ph-secondary cursor-pointer"
                  >
                    <span>{selectedBrand}</span>
                    <ChevronDown className={cn('w-3 h-3 transition-transform', brandMenuOpen && 'rotate-180')} />
                  </button>
                  {brandMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setBrandMenuOpen(false)} />
                      <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-sidebar-border rounded-md shadow-card-hover py-1 z-30">
                        {brands.map((brand) => (
                          <button
                            key={brand}
                            className={cn(
                              'w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors',
                              selectedBrand === brand
                                ? 'bg-primary/10 text-ph-text font-medium'
                                : 'text-ph-secondary hover:bg-sidebar-hover'
                            )}
                            onClick={() => {
                              setSelectedBrand(brand);
                              setBrandMenuOpen(false);
                            }}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden md:flex items-center justify-center w-full py-1 text-ph-muted hover:text-ph-secondary transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
```

- [ ] **Step 4: Create `src/components/layout/Header.tsx`**

Simplified header — page title on left, notification + avatar on right:

```tsx
import { useState } from 'react';
import { Bell, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const notifications = [
  { id: 'n1', title: 'SMS 主要供應商切換為備援', time: '2 分鐘前', severity: 'error' as const },
  { id: 'n2', title: 'LINE 預算已達 72%', time: '15 分鐘前', severity: 'warning' as const },
  { id: 'n3', title: 'GDPR 刪除請求 g2 進入執行中', time: '34 分鐘前', severity: 'info' as const },
];

const severityIcon = {
  error: <AlertCircle className="w-4 h-4 text-ph-danger" />,
  warning: <AlertTriangle className="w-4 h-4 text-ph-warning" />,
  info: <Info className="w-4 h-4 text-ph-blue" />,
};

export const Header = ({ title, breadcrumb }: { title: string; breadcrumb?: string }) => {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb && (
          <>
            <span className="text-ph-muted">{breadcrumb}</span>
            <span className="text-ph-muted">/</span>
          </>
        )}
        <span className="font-medium text-ph-text">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-ph-danger rounded-full ring-2 ring-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>通知</span>
              <Badge variant="destructive" className="text-[10px]">3 則未讀</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((item) => (
              <DropdownMenuItem key={item.id} className="flex items-start gap-3 py-3 cursor-pointer">
                <div className="mt-0.5 shrink-0">{severityIcon[item.severity]}</div>
                <div>
                  <div className="text-sm">{item.title}</div>
                  <div className="text-xs text-ph-muted mt-0.5">{item.time}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-ph-blue flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
              AC
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">Amber Chang</div>
              <div className="text-xs text-ph-muted font-normal">System Admin</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-ph-muted">
              全品牌權限
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
```

- [ ] **Step 5: Create `src/components/layout/Layout.tsx`**

Shell combining sidebar + header + content area:

```tsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; breadcrumb?: string }> = {
  '/': { title: 'Dashboard' },
  '/people': { title: 'People' },
  '/data': { title: 'Events' },
  '/audience': { title: 'Cohorts' },
  '/delivery': { title: 'Delivery' },
  '/journeys': { title: 'Journeys' },
  '/campaigns': { title: 'Campaigns' },
  '/settings': { title: 'Settings' },
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageInfo = pageTitles[location.pathname] || { title: '' };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between h-14 bg-white border-b border-border px-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-ph-secondary cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-ph-text text-sm">CORA</span>
          <div className="w-5 h-5" />
        </div>

        <Header title={pageInfo.title} breadcrumb={pageInfo.breadcrumb} />

        <div className="flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </main>
    </div>
  );
};
```

- [ ] **Step 6: Slim down `src/App.tsx`**

Replace the entire file. Remove all layout components (SidebarItem, Topbar, Layout, PageHeader, KpiCard, ProgressBar, AlertItem, Dashboard). App.tsx becomes just Router + Routes. Dashboard moves to its own page in Task 3.

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import DashboardPage from '@/pages/dashboard';
import PeopleViewPage from '@/pages/people';
import AudiencePage from '@/pages/audience';
import CampaignsPage from '@/pages/campaigns';
import JourneysPage from '@/pages/journeys';
import DeliveryPage from '@/pages/delivery';
import DataCorePage from '@/pages/data';
import SystemAdminPage from '@/pages/settings';

export function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/people" element={<PeopleViewPage />} />
          <Route path="/audience" element={<AudiencePage />} />
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
```

**Note:** At this point the page imports will break because the pages haven't been moved yet. That's OK — Tasks 3–9 will create the new page files. To keep the build working during transition, the agent should temporarily re-export the old pages from the new paths until each page is converted. For example, create `src/pages/dashboard/index.tsx` that re-exports the Dashboard component.

- [ ] **Step 7: Verify dev server runs**

```bash
cd /Users/amberchang/Desktop/cora-prototype && npm run dev
```

Expected: App loads with new light sidebar and simplified header. Pages may have mixed old/new styling — that's expected.

- [ ] **Step 8: Commit**

```bash
cd /Users/amberchang/Desktop/cora-prototype
git add -A
git commit -m "[AI-DEV] feat: rebuild Layout with PostHog-style sidebar + header

- New light sidebar with INSIGHTS/ACTION groups, collapsible, search box
- Simplified header with breadcrumb, notifications dropdown, user avatar
- Extract PageHeader and EmptyState shared components
- Slim App.tsx to Router + Routes only
- AI-assisted development, review notes: layout only, pages converted separately"
```

---

## Task 3: Convert Dashboard Page

**Files:**
- Create: `src/pages/dashboard/index.tsx`
- Create: `src/pages/dashboard/KpiCard.tsx`
- Create: `src/pages/dashboard/AlertsSection.tsx`
- Delete: Dashboard code from old App.tsx (already done in Task 2)

- [ ] **Step 1: Create `src/pages/dashboard/KpiCard.tsx`**

Extract KpiCard from old App.tsx, replace `.kpi-card` with shadcn `Card`:

```tsx
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const KpiCard = ({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
}) => {
  const trendColor = trend === 'up' ? 'text-ph-success' : trend === 'down' ? 'text-ph-danger' : 'text-ph-muted';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-ph-muted">{label}</span>
          {trend && <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />}
        </div>
        <div className="text-2xl font-semibold text-ph-text mb-1">{value}</div>
        <div className={`text-xs ${trend === 'up' ? 'text-ph-success' : 'text-ph-secondary'}`}>{sub}</div>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 2: Create `src/pages/dashboard/AlertsSection.tsx`**

Replace hand-written AlertItem with shadcn `Alert`:

```tsx
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const alerts = [
  { severity: 'error' as const, message: 'SMS 主要供應商連續失敗，已切換備援（2 分鐘前）' },
  { severity: 'warning' as const, message: 'LINE 預算達 72%，接近提醒門檻（80%）' },
  { severity: 'info' as const, message: '本日有 3 筆 GDPR Request 仍在處理中' },
];

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantMap = {
  error: 'destructive' as const,
  warning: 'default' as const,
  info: 'default' as const,
};

export const AlertsSection = () => (
  <div className="space-y-3">
    {alerts.map((item, i) => {
      const Icon = iconMap[item.severity];
      return (
        <Alert key={i} variant={variantMap[item.severity]}>
          <Icon className="w-4 h-4" />
          <AlertDescription>{item.message}</AlertDescription>
        </Alert>
      );
    })}
  </div>
);
```

- [ ] **Step 3: Create `src/pages/dashboard/index.tsx`**

Compose Dashboard from sub-components. Replace old styling with shadcn `Card`, `Badge`. Keep ProgressBar inline (small enough). Keep all mock data identical.

```tsx
import { Send, TrendingUp, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from './KpiCard';
import { AlertsSection } from './AlertsSection';

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-sm text-ph-text font-medium">{label}</span>
      <span className="text-sm font-semibold text-ph-text">{value}%</span>
    </div>
    <div className="h-2 bg-ph-surface rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const stats = [
  { label: '發送任務', value: '42', icon: Send },
  { label: '平均送達率', value: '97.1%', icon: TrendingUp },
  { label: '平均點擊率', value: '6.8%', icon: Zap },
  { label: '問卷完成數', value: '5,204', icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader title="總覽儀表板" description="全站數據與行銷活動概況" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="ID 覆蓋率" value="96.4%" sub="目標 95%（達標）" trend="up" />
        <KpiCard label="事件入庫延遲 P95" value="3.2s" sub="Data Core 目標 < 5s" trend="up" />
        <KpiCard label="今日活躍分群" value="128" sub="含 23 個即時更新分群" trend="neutral" />
        <KpiCard label="進行中旅程" value="17" sub="啟用上限 50" trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">遞送與活動成效</CardTitle>
            <Badge variant="secondary">近 24h</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {stats.map((item) => (
                <div key={item.label} className="border border-border rounded-md p-4 hover:bg-ph-surface transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-3.5 h-3.5 text-ph-muted" />
                    <span className="text-ph-muted text-xs">{item.label}</span>
                  </div>
                  <div className="text-xl font-semibold text-ph-text">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-xs text-ph-muted">
              渠道拆分：Push 18 ｜ LINE 9 ｜ SMS 6 ｜ Email 9
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">預算使用率</CardTitle>
            <Badge variant="secondary">本月</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressBar label="SMS" value={64} color="bg-ph-blue" />
            <ProgressBar label="LINE" value={72} color="bg-ph-success" />
            <ProgressBar label="Email" value={24} color="bg-ph-warning" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">系統告警與待處理事項</CardTitle>
          <Badge variant="destructive">3 則待處理</Badge>
        </CardHeader>
        <CardContent>
          <AlertsSection />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
cd /Users/amberchang/Desktop/cora-prototype && npm run dev
```

Open http://localhost:5173/cora-prototype/ and verify Dashboard renders with new styling.

- [ ] **Step 5: Commit**

```bash
cd /Users/amberchang/Desktop/cora-prototype
git add -A
git commit -m "[AI-DEV] feat: convert Dashboard to PostHog style

- Split into KpiCard + AlertsSection sub-components
- Replace .kpi-card with shadcn Card (no gradient top-line)
- Replace AlertItem with shadcn Alert
- Replace .badge with shadcn Badge
- AI-assisted development, review notes: mock data unchanged"
```

---

## Task 4: Convert DataCore Page

**Files:**
- Create: `src/pages/data/index.tsx`
- Create: `src/pages/data/EventCatalog.tsx`
- Create: `src/pages/data/QueryBuilder.tsx`
- Delete: `src/pages/DataCore.tsx` (after conversion)

The agent should:
1. Read the current `src/pages/DataCore.tsx` (379 lines)
2. Split into `EventCatalog.tsx` (event list + SDK matrix) and `QueryBuilder.tsx` (query section)
3. Replace hand-written tabs with shadcn `Tabs`
4. Replace div-tables with shadcn `Table`
5. Update all colors to PostHog palette (ph-text, ph-secondary, ph-muted, etc.)
6. Keep all mock data and business logic identical
7. Verify in browser, commit

- [ ] **Step 1: Read current DataCore.tsx and plan the split**
- [ ] **Step 2: Create `src/pages/data/EventCatalog.tsx`** — events table + SDK matrix using shadcn `Table`
- [ ] **Step 3: Create `src/pages/data/QueryBuilder.tsx`** — query section using shadcn `Input`, `Select`, `Button`
- [ ] **Step 4: Create `src/pages/data/index.tsx`** — compose with shadcn `Tabs`, import sub-components
- [ ] **Step 5: Delete `src/pages/DataCore.tsx`**
- [ ] **Step 6: Verify in browser**
- [ ] **Step 7: Commit**

```bash
git commit -m "[AI-DEV] feat: convert DataCore to PostHog style

- Split into EventCatalog + QueryBuilder sub-components
- Replace hand-written tabs with shadcn Tabs
- Replace div-tables with shadcn Table
- AI-assisted development, review notes: mock data unchanged"
```

---

## Task 5: Convert SystemAdmin Page

**Files:**
- Create: `src/pages/settings/index.tsx`
- Create: `src/pages/settings/RbacTab.tsx`
- Create: `src/pages/settings/ChannelsTab.tsx`
- Create: `src/pages/settings/BudgetTab.tsx`
- Create: `src/pages/settings/AuditTab.tsx`
- Create: `src/pages/settings/NotifyTab.tsx`
- Create: `src/pages/settings/GdprTab.tsx`
- Delete: `src/pages/SystemAdmin.tsx`

The agent should:
1. Read current `src/pages/SystemAdmin.tsx` (432 lines)
2. Split into 6 tab sub-components (one per tab)
3. Replace hand-written tabs with shadcn `Tabs`
4. Replace user list with shadcn `Table`
5. Replace channel cards with shadcn `Card` + health `Badge`
6. Replace audit log with shadcn `Table`
7. Keep all mock data and business logic identical
8. Verify in browser, commit

- [ ] **Step 1: Read current SystemAdmin.tsx and plan the split**
- [ ] **Step 2: Create each tab component** — RbacTab, ChannelsTab, BudgetTab, AuditTab, NotifyTab, GdprTab
- [ ] **Step 3: Create `src/pages/settings/index.tsx`** — compose with shadcn `Tabs`
- [ ] **Step 4: Delete `src/pages/SystemAdmin.tsx`**
- [ ] **Step 5: Verify in browser**
- [ ] **Step 6: Commit**

```bash
git commit -m "[AI-DEV] feat: convert SystemAdmin to PostHog style

- Split into 6 tab sub-components (RBAC, Channels, Budget, Audit, Notify, GDPR)
- Replace hand-written tabs with shadcn Tabs
- Replace tables with shadcn Table, cards with shadcn Card
- AI-assisted development, review notes: mock data unchanged"
```

---

## Task 6: Convert Campaigns Page

**Files:**
- Create: `src/pages/campaigns/index.tsx`
- Create: `src/pages/campaigns/CampaignList.tsx`
- Delete: `src/pages/Campaigns.tsx`

Same pattern: read → split → replace components → update colors → verify → commit.

- [ ] **Step 1: Read current Campaigns.tsx (896 lines) and plan the split**
- [ ] **Step 2: Create sub-components**
- [ ] **Step 3: Create index.tsx**
- [ ] **Step 4: Delete old file, verify, commit**

---

## Task 7: Convert Delivery Page

**Files:**
- Create: `src/pages/delivery/index.tsx`
- Create: `src/pages/delivery/TaskList.tsx`
- Create: `src/pages/delivery/TaskEditor.tsx`
- Delete: `src/pages/Delivery.tsx`

- [ ] **Step 1: Read current Delivery.tsx (918 lines) and plan the split**
- [ ] **Step 2: Create sub-components**
- [ ] **Step 3: Create index.tsx**
- [ ] **Step 4: Delete old file, verify, commit**

---

## Task 8: Convert PeopleView Page

**Files:**
- Create: `src/pages/people/index.tsx`
- Create: `src/pages/people/SearchResults.tsx`
- Create: `src/pages/people/UserDetail.tsx`
- Create: `src/pages/people/Timeline.tsx`
- Delete: `src/pages/PeopleView.tsx`

- [ ] **Step 1: Read current PeopleView.tsx (950 lines) and plan the split**
- [ ] **Step 2: Create sub-components** (Timeline keeps border-l pattern, just update colors)
- [ ] **Step 3: Create index.tsx**
- [ ] **Step 4: Delete old file, verify, commit**

---

## Task 9: Convert Audience Page

**Files:**
- Create: `src/pages/audience/index.tsx`
- Create: `src/pages/audience/SegmentList.tsx`
- Create: `src/pages/audience/SegmentEditor.tsx`
- Create: `src/pages/audience/ConditionBuilder.tsx`
- Delete: `src/pages/Audience.tsx`

- [ ] **Step 1: Read current Audience.tsx (1165 lines) and plan the split**
- [ ] **Step 2: Create ConditionBuilder.tsx** — nested AND/OR logic stays, update styling only
- [ ] **Step 3: Create SegmentList.tsx and SegmentEditor.tsx**
- [ ] **Step 4: Create index.tsx**
- [ ] **Step 5: Delete old file, verify, commit**

---

## Task 10: Convert Journeys Page

**Files:**
- Create: `src/pages/journeys/index.tsx`
- Create: `src/pages/journeys/JourneyList.tsx`
- Create: `src/pages/journeys/JourneyCanvas.tsx`
- Delete: `src/pages/Journeys.tsx`

**Important:** React Flow canvas stays as-is. Only the journey list and stats get updated.

- [ ] **Step 1: Read current Journeys.tsx (1414 lines) and plan the split**
- [ ] **Step 2: Create JourneyCanvas.tsx** — move React Flow code with minimal style changes
- [ ] **Step 3: Create JourneyList.tsx** — use shadcn `Table` + `Badge`
- [ ] **Step 4: Create index.tsx**
- [ ] **Step 5: Delete old file, verify, commit**

---

## Task 11: Final Cleanup and Verification

**Files:**
- Modify: `.gitignore` (add `.superpowers/`)
- Delete: any remaining old page files in `src/pages/`

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**
- [ ] **Step 2: Verify all routes work**

Open each route in the browser and verify:
- `/` — Dashboard
- `/people` — People View
- `/audience` — Audience Segmentation
- `/campaigns` — Campaigns
- `/journeys` — Journeys (canvas must still work)
- `/delivery` — Delivery
- `/data` — Data Core / Events
- `/settings` — System Admin

- [ ] **Step 3: Verify sidebar collapse works**
- [ ] **Step 4: Verify mobile responsive (resize browser)**
- [ ] **Step 5: Run build**

```bash
cd /Users/amberchang/Desktop/cora-prototype && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Final commit**

```bash
git commit -m "[AI-DEV] chore: final cleanup — PostHog style redesign complete

- All 8 pages converted to PostHog style with shadcn/ui components
- Pages split into sub-components (no file > 300 lines)
- Add .superpowers/ to .gitignore
- AI-assisted development, review notes: visual redesign only, all mock data preserved"
```
