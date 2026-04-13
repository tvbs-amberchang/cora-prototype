// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Delivery page — composes TaskList + TaskEditor

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { TaskList } from './TaskList';
import { TaskEditor } from './TaskEditor';
import { type SendTask, initialTasks, simulatePipeline } from './types';

export default function Delivery() {
  const [tasks, setTasks] = useState<SendTask[]>(initialTasks);
  const [view, setView] = useState<'list' | 'create'>('list');

  const handleComplete = (
    partial: Omit<SendTask, 'id' | 'createdAt'> & { metrics: ReturnType<typeof simulatePipeline> }
  ) => {
    const newTask: SendTask = {
      ...partial,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setTasks((prev) => [newTask, ...prev]);
    setView('list');
  };

  const handleDuplicate = (task: SendTask) => {
    const copy: SendTask = {
      ...task,
      id: `task_${Date.now()}`,
      name: `${task.name}（複製）`,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setTasks((prev) => [copy, ...prev]);
  };

  if (view === 'create') {
    return (
      <TaskEditor
        onBack={() => setView('list')}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="訊息遞送"
        description="統一管理 Push / LINE / SMS / Email 的發送任務、規則攔截與成效追蹤"
      />
      <TaskList
        tasks={tasks}
        onCreateNew={() => setView('create')}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
}
