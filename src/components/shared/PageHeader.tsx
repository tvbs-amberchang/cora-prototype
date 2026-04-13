// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Reusable page header component with title and description

import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => (
  <div className="mb-8">
    <h1 className="text-2xl font-semibold text-ph-text tracking-tight mb-1">{title}</h1>
    <p className="text-ph-secondary text-sm">{description}</p>
  </div>
);
