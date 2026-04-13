// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Alerts section using shadcn Alert component

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertItemData {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const iconMap = {
  error: <AlertCircle className="w-4 h-4 text-ph-danger flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-ph-muted flex-shrink-0" />,
};

const variantMap: Record<AlertItemData['severity'], 'default' | 'destructive'> = {
  error: 'destructive',
  warning: 'default',
  info: 'default',
};

interface AlertsSectionProps {
  alerts: AlertItemData[];
}

const AlertsSection = ({ alerts }: AlertsSectionProps) => (
  <div className="space-y-3">
    {alerts.map((alert) => (
      <Alert key={alert.message} variant={variantMap[alert.severity]}>
        {iconMap[alert.severity]}
        <AlertDescription>{alert.message}</AlertDescription>
      </Alert>
    ))}
  </div>
);

export default AlertsSection;
