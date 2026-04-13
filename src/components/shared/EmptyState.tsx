// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Reusable centered empty state component with icon, title, description, and optional reset button

import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState = ({
  title,
  description,
  onReset,
  resetLabel = 'Reset',
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-sidebar-hover flex items-center justify-center mb-4">
      <Inbox className="w-6 h-6 text-ph-muted" />
    </div>
    <h3 className="text-base font-semibold text-ph-text mb-1">{title}</h3>
    <p className="text-sm text-ph-secondary max-w-sm mb-4">{description}</p>
    {onReset && (
      <Button variant="outline" size="sm" onClick={onReset}>
        {resetLabel}
      </Button>
    )}
  </div>
);
