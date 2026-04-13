// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Nested AND/OR condition group builder for segment creation

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type GroupLogic, type GroupRelation } from './types';

interface ConditionGroupProps {
  title: string;
  logic: GroupLogic;
  conditions: string[];
  onLogicChange: (value: GroupLogic) => void;
  onConditionsChange: (value: string[]) => void;
  canAddMore: boolean;
}

export const ConditionGroup = ({
  title,
  logic,
  conditions,
  onLogicChange,
  onConditionsChange,
  canAddMore,
}: ConditionGroupProps) => {
  const updateAt = (index: number, value: string) => {
    const copied = [...conditions];
    copied[index] = value;
    onConditionsChange(copied);
  };

  const removeAt = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-ph-surface space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-ph-text">{title}</span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-ph-secondary">群組邏輯</span>
          <select
            value={logic}
            onChange={(e) => onLogicChange(e.target.value as GroupLogic)}
            className="px-2 py-1 border border-border rounded bg-white text-ph-text text-xs"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
      </div>

      {conditions.map((condition, idx) => (
        <div key={`${title}-${idx}`} className="flex items-center space-x-2">
          <Input
            value={condition}
            onChange={(e) => updateAt(idx, e.target.value)}
            className="flex-1 text-sm"
            placeholder="例如：行為｜page_view｜≥ 3 次｜近 7 天"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeAt(idx)}
            className="text-red-600 border-red-200 hover:bg-red-50 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={!canAddMore}
        onClick={() => onConditionsChange([...conditions, ''])}
        className="text-sm text-blue-600 hover:text-blue-700 disabled:text-ph-muted px-0"
      >
        + 新增條件
      </Button>
    </div>
  );
};

interface ConditionBuilderProps {
  groupLogic: GroupLogic;
  conditions: string[];
  relationToNextGroup: GroupRelation;
  secondaryGroupLogic: GroupLogic;
  secondaryConditions: string[];
  onGroupLogicChange: (v: GroupLogic) => void;
  onConditionsChange: (v: string[]) => void;
  onRelationToNextGroupChange: (v: GroupRelation) => void;
  onSecondaryGroupLogicChange: (v: GroupLogic) => void;
  onSecondaryConditionsChange: (v: string[]) => void;
  conditionCount: number;
  overLimit: boolean;
}

export const ConditionBuilder = ({
  groupLogic,
  conditions,
  relationToNextGroup,
  secondaryGroupLogic,
  secondaryConditions,
  onGroupLogicChange,
  onConditionsChange,
  onRelationToNextGroupChange,
  onSecondaryGroupLogicChange,
  onSecondaryConditionsChange,
  conditionCount,
  overLimit,
}: ConditionBuilderProps) => {
  const hasSecondaryGroup = secondaryConditions.length > 0;

  return (
    <div className="space-y-4">
      <ConditionGroup
        title="條件組 A"
        logic={groupLogic}
        conditions={conditions}
        onLogicChange={onGroupLogicChange}
        onConditionsChange={onConditionsChange}
        canAddMore={conditionCount < 20}
      />

      {hasSecondaryGroup && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-ph-secondary">條件組關係</span>
          <select
            value={relationToNextGroup}
            onChange={(e) => onRelationToNextGroupChange(e.target.value as GroupRelation)}
            className="px-3 py-1 border border-border rounded-full text-sm bg-white text-ph-text"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
            <option value="AND NOT">AND NOT</option>
          </select>
        </div>
      )}

      {hasSecondaryGroup && (
        <ConditionGroup
          title="條件組 B"
          logic={secondaryGroupLogic}
          conditions={secondaryConditions}
          onLogicChange={onSecondaryGroupLogicChange}
          onConditionsChange={onSecondaryConditionsChange}
          canAddMore={conditionCount < 20}
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={hasSecondaryGroup}
        onClick={() => onSecondaryConditionsChange([''])}
        className="text-sm text-blue-600 hover:text-blue-700 disabled:text-ph-muted px-0"
      >
        + 新增條件組 B
      </Button>

      <div className={`text-sm ${overLimit ? 'text-red-600' : 'text-ph-secondary'}`}>
        條件總數：{conditionCount}/20
      </div>

      {overLimit && (
        <Badge variant="destructive" className="text-sm">
          單一分群最多 20 個條件，請刪減後再繼續。
        </Badge>
      )}
    </div>
  );
};
