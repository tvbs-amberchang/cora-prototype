// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Settings page — PostHog-style tab composition for SystemAdmin

import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import RbacTab from './RbacTab';
import ChannelsTab from './ChannelsTab';
import BudgetTab from './BudgetTab';
import AuditTab from './AuditTab';
import NotifyTab from './NotifyTab';
import GdprTab from './GdprTab';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 ">
      <PageHeader
        title="系統管理與設定"
        description="RBAC、渠道憑證、預算管理、稽核日誌與系統通知"
      />

      <Tabs defaultValue="rbac" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="rbac">角色與權限</TabsTrigger>
          <TabsTrigger value="channels">渠道連線</TabsTrigger>
          <TabsTrigger value="budget">預算管理</TabsTrigger>
          <TabsTrigger value="audit">操作日誌</TabsTrigger>
          <TabsTrigger value="notify">系統通知</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR 流程</TabsTrigger>
        </TabsList>

        <TabsContent value="rbac">
          <RbacTab />
        </TabsContent>

        <TabsContent value="channels">
          <ChannelsTab />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>

        <TabsContent value="notify">
          <NotifyTab />
        </TabsContent>

        <TabsContent value="gdpr">
          <GdprTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
