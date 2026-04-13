// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: KPI card using shadcn Card — no gradient top-line, PostHog color tokens

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
}

const KpiCard = ({ label, value, sub, trend }: KpiCardProps) => {
  const trendColor =
    trend === 'up'
      ? 'text-ph-success'
      : trend === 'down'
      ? 'text-ph-danger'
      : 'text-ph-muted';

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-ph-secondary">{label}</span>
          {trend && (
            <span className={cn('flex items-center', trendColor)}>
              {trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-ph-text mb-1">{value}</div>
        <div className={cn('text-xs', trend === 'up' ? 'text-ph-success' : 'text-ph-secondary')}>
          {sub}
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
