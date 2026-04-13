// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: DataCore page — composes EventCatalog sub-components and QueryBuilder using shadcn Tabs

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { EventsTab, SdkTab, ContentTab, CustomTab, AttributesTab } from './EventCatalog';
import { QueryBuilder } from './QueryBuilder';

export default function DataCore() {
  return (
    <div className="p-6 md:p-8 ">
      <PageHeader
        title="數據追蹤"
        description="統一事件模型、SDK 追蹤、內容屬性擷取與下游即時查詢"
      />

      <Tabs defaultValue="events">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="events">事件目錄</TabsTrigger>
          <TabsTrigger value="sdk">SDK 追蹤能力</TabsTrigger>
          <TabsTrigger value="content">內容屬性擷取</TabsTrigger>
          <TabsTrigger value="custom">自訂事件治理</TabsTrigger>
          <TabsTrigger value="attributes">用戶屬性字典</TabsTrigger>
          <TabsTrigger value="retention">保留與查詢</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventsTab />
        </TabsContent>

        <TabsContent value="sdk">
          <SdkTab />
        </TabsContent>

        <TabsContent value="content">
          <ContentTab />
        </TabsContent>

        <TabsContent value="custom">
          <CustomTab />
        </TabsContent>

        <TabsContent value="attributes">
          <AttributesTab />
        </TabsContent>

        <TabsContent value="retention">
          <QueryBuilder />
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-xs text-ph-secondary bg-ph-surface border border-border rounded p-4">
        Data Core 與下游對接：Segmentation（PRD-004）讀事件條件、Delivery（PRD-005）寫入 `message_*`、People View（PRD-006）顯示個體事件時間線。
      </div>
    </div>
  );
}
