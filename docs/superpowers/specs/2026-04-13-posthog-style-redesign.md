---
title: "CORA Prototype — PostHog Style Redesign"
created: 2026-04-13
last_updated: 2026-04-13
status: approved
---

# CORA Prototype — PostHog Style Redesign

## Goal

Transform the existing CORA prototype from a Webflow-inspired dark sidebar design to a PostHog-style light, neutral, tool-oriented UI. Keep all existing functionality and mock data — change only visual style, layout, and component quality.

## Constraints

- No new features or business logic changes
- No real API integration (stays mock data)
- No dark mode (Phase 3)
- React Flow canvas (Journeys) untouched
- Must stay deployable to GitHub Pages

---

## §1 Design System (Design Tokens)

### Color Palette

| Token | From (Webflow) | To (PostHog-like) | Usage |
|-------|---------------|-------------------|-------|
| `primary` | `#146ef5` | `#1d4aff` | Buttons, active states, links |
| `background` | `#ffffff` | `#ffffff` | Main content area |
| `surface` | `#f7f7f7` | `#f3f4f6` | Card backgrounds, section fills |
| `sidebar-bg` | `#0f1a33→#080e1c` gradient | `#fafaf9` solid | Sidebar background |
| `border` | `#d8d8d8` | `#e5e5e5` | Dividers, card borders |
| `text-primary` | `#080808` | `#1d1f27` | Headings, body text |
| `text-secondary` | `#5a5a5a` | `#5e5e5e` | Descriptions |
| `text-muted` | — | `#999999` | Placeholders, labels |
| `success` | `#00d722` | `#36b37e` | Positive status |
| `warning` | `#ffae13` | `#f5a623` | Warning status |
| `danger` | `#ee1d36` | `#ef4444` | Error, delete |

### Typography

```
From: "WF Visual Sans Variable", Inter, Noto Sans TC, system-ui
To:   Inter, "Noto Sans TC", system-ui, -apple-system, sans-serif
```

Drop the Webflow custom font. Inter is the primary (same family PostHog uses). Noto Sans TC stays for Chinese text.

### Border Radius & Shadow

| Token | From | To |
|-------|------|-----|
| Card radius | 8px | 6px |
| Button radius | 4px | 6px |
| Card shadow | 5-layer Webflow stack | `0 1px 3px rgba(0,0,0,0.08)` |
| Card hover shadow | intensified 5-layer | `0 2px 8px rgba(0,0,0,0.12)` |

---

## §2 Layout Structure

### Sidebar

- **Background**: `#fafaf9` with right border `#e5e5e5`
- **Width**: 240px default, collapsible to 60px (icon-only)
- **Collapse**: Toggle button at sidebar bottom; tooltips show item names when collapsed
- **Mobile**: Overlay slide-out (keep existing behavior)

**Navigation Groups** (workflow-based):

```
CORA Logo + Name
──────────────────
🔍 Search... (Cmd+K)
──────────────────
INSIGHTS
  📊 Dashboard
  👤 People
  🗄️ Events
──────────────────
ACTION
  👥 Cohorts
  ✉️ Delivery
  🔄 Journeys
  📢 Campaigns
──────────────────
(flex spacer)
──────────────────
⚙️ Settings
──────────────────
🟦 AC  Amber Chang
      全部品牌 ▼
```

**Active item**: `background: #e8e8e6`, `color: #1d1f27`, `font-weight: 500`
**Inactive item**: `color: #5e5e5e`
**Group label**: `font-size: 10px`, `text-transform: uppercase`, `color: #999`, `letter-spacing: 0.5px`

### Header (simplified)

```
┌─────────────────────────────────────────────────────┐
│  Page Title + Breadcrumb              🔔  👤 Avatar │
└─────────────────────────────────────────────────────┘
```

- Search moves to sidebar — header becomes lighter
- Left: page title (e.g. "Dashboard", "System Admin > RBAC")
- Right: notification bell + user avatar (click for profile dropdown)
- Height: 56px (down from 64px)

---

## §3 Component Library (shadcn/ui)

### Installation

Add shadcn/ui (based on Radix UI + Tailwind CSS). Requires:
- `tailwindcss-animate`
- `class-variance-authority`
- `clsx` + `tailwind-merge`
- `@radix-ui/react-*` (installed per component)

### Component Replacement Map

| Current | shadcn/ui Component | Pages |
|---------|-------------------|-------|
| `.btn-primary` / `.btn-secondary` | `Button` (default/outline/ghost) | All |
| `.badge` (hand-written) | `Badge` (default/secondary/destructive/outline) | Audience, Delivery, Campaigns |
| `.input-base` | `Input` | All forms |
| `.card` / `.kpi-card` | `Card` + `CardHeader` + `CardContent` | Dashboard, all |
| div-based tables | `Table` + `TableHeader` + `TableRow` + `TableCell` | People, Audience, Delivery, Campaigns, DataCore, SystemAdmin |
| Hand-written tab buttons | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | DataCore, SystemAdmin |
| Hand-written modal (fixed inset-0) | `Dialog` + `DialogContent` + `DialogHeader` | Delivery, Audience |
| Hand-written dropdown | `DropdownMenu` | Header, brand selector, notifications |
| Hand-written select | `Select` + `SelectTrigger` + `SelectContent` | Delivery, Audience |
| (new) | `Skeleton` | All pages (loading states) |
| (new) | `Separator` | Sidebar, form sections |
| (new) | `Tooltip` | Collapsed sidebar icon labels |
| (new) | `Alert` | Dashboard system alerts |

### Components NOT Replaced

| Component | Reason |
|-----------|--------|
| React Flow canvas (Journeys) | Already a professional library |
| Timeline (PeopleView) | Hand-written border-l is adequate |
| KPI number display | Wrap in Card, keep internal logic |

---

## §4 Page-by-Page Changes

### File Structure Change

Large pages split into sub-components (target: no file > 300 lines):

```
src/pages/
├── Dashboard.tsx                → pages/dashboard/index.tsx + KpiCard.tsx + AlertsSection.tsx
├── PeopleView.tsx               → pages/people/index.tsx + SearchResults.tsx + UserDetail.tsx + Timeline.tsx
├── Audience.tsx                 → pages/audience/index.tsx + SegmentList.tsx + SegmentEditor.tsx + ConditionBuilder.tsx
├── Campaigns.tsx                → pages/campaigns/index.tsx + CampaignList.tsx + CampaignEditor.tsx
├── Journeys.tsx                 → pages/journeys/index.tsx + JourneyList.tsx + JourneyCanvas.tsx
├── Delivery.tsx                 → pages/delivery/index.tsx + TaskList.tsx + TaskEditor.tsx
├── DataCore.tsx                 → pages/data/index.tsx + EventCatalog.tsx + QueryBuilder.tsx
└── SystemAdmin.tsx              → pages/settings/index.tsx + RbacTab.tsx + ChannelsTab.tsx + BudgetTab.tsx + AuditTab.tsx + NotifyTab.tsx + GdprTab.tsx
```

### Per-Page Summary

**Dashboard** — KPI cards: remove gradient top-line, use `Card`. System alerts: use `Alert`. Tables: use `Table`.

**People View** — Search results: use `Table`. User detail: use `Card` + `Separator`. Search input: use `Input`. Timeline: keep border-l, just update colors.

**Audience** — Segment list: use `Table` with sorting. Create/edit: use `Dialog`. Badges: use `Badge`. Split into 3 sub-components. ConditionBuilder nested AND/OR logic stays unchanged.

**Campaigns** — Campaign list: use `Table`. Forms: use `Input` + `Select`. Badges: unified. Status colors: match new palette.

**Journeys** — Journey list: use `Table` + `Badge`. Stats: use `Card`. **React Flow canvas untouched.** Split list vs canvas into sub-components.

**Delivery** — Task list: use `Table`. Audience selection: use `Select`. Schedule: use `Dialog`. Rules config: use `Input` + `Select`.

**DataCore** — Tabs: use `Tabs`. Event list: use `Table`. SDK matrix: use `Table`. Query builder: use `Input` + `Select`.

**SystemAdmin** — Tabs: use `Tabs`. User list: use `Table`. Channel cards: use `Card` + health `Badge`. Audit logs: use `Table`. Split into 6 tab sub-components.

---

## §5 New Additions (Empty & Loading States)

### Skeleton Loading

Every page wraps its main content in a loading check. Before data renders, show `Skeleton` placeholders:
- Table: 5 rows of skeleton bars
- Cards: skeleton rectangles matching card dimensions
- Stats: skeleton number blocks

Since this is a mock-data prototype, loading state triggers on initial render for 300ms (simulated), then shows real content.

### Empty States

When a filtered/searched list returns 0 results, show a centered empty state:
```
┌─────────────────────────────┐
│     📭                      │
│  沒有找到符合條件的結果        │
│  試試調整篩選條件             │
│                             │
│  [重設篩選]                  │
└─────────────────────────────┘
```

---

## §6 Implementation Order

Incremental replacement — each step produces a working, viewable result:

```
Step 1: Foundation
  ├─ Install shadcn/ui + dependencies
  ├─ Update tailwind.config.js (new tokens)
  ├─ Update index.css (remove Webflow classes, add shadcn base)
  └─ Rebuild Layout: new Sidebar + simplified Header in App.tsx

Step 2: Pages (simple → complex)
  ├─ DataCore (379 lines — smallest, good pilot)
  ├─ SystemAdmin (432 lines — next SPEC target)
  ├─ Dashboard (503 lines)
  ├─ Campaigns (896 lines)
  ├─ Delivery (918 lines)
  ├─ PeopleView (950 lines)
  ├─ Audience (1165 lines)
  └─ Journeys (1414 lines — canvas untouched)
```

Each page step includes: component replacement + file splitting + color/style update.

---

## §7 Out of Scope

- Dark mode support
- Real API integration
- New features or business logic
- React Flow canvas changes
- i18n / multi-language
- Authentication / login flow
- Performance optimization (code splitting, lazy loading)
- Unit tests
