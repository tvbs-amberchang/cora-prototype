// [AI-ASSISTED] by Amber, 2026-04-14
// 功能：Data Core 頁面入口 — 6 個 Tab（事件目錄/SDK追蹤/屬性管理/自訂事件/資料品質/查詢）

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EventsTab, SdkTab, PropertiesTab, CustomTab } from './EventCatalog';
import { DataQualityTab } from './DataQuality';
import { QueryBuilder } from './QueryBuilder';

export default function DataCore() {
  return (
    <div className="p-6 md:p-8">
      <Tabs defaultValue="events">
        <TabsList className="mb-6">
          <TabsTrigger value="events">事件目錄</TabsTrigger>
          <TabsTrigger value="sdk">SDK追蹤</TabsTrigger>
          <TabsTrigger value="properties">屬性管理</TabsTrigger>
          <TabsTrigger value="custom">自訂事件</TabsTrigger>
          <TabsTrigger value="quality">資料品質</TabsTrigger>
          <TabsTrigger value="query">查詢</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventsTab />
        </TabsContent>
        <TabsContent value="sdk">
          <SdkTab />
        </TabsContent>
        <TabsContent value="properties">
          <PropertiesTab />
        </TabsContent>
        <TabsContent value="custom">
          <CustomTab />
        </TabsContent>
        <TabsContent value="quality">
          <DataQualityTab />
        </TabsContent>
        <TabsContent value="query">
          <QueryBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
