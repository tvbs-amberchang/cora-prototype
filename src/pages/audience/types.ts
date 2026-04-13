// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: Shared types, mock data, and utilities for the Audience module

export type SegmentStatus = 'draft' | 'active' | 'paused' | 'archived';
export type SegmentType = 'dynamic' | 'static';
export type UserRole = 'system_admin' | 'marketer';
export type GroupRelation = 'AND' | 'OR' | 'AND NOT';
export type GroupLogic = 'AND' | 'OR';

export interface Segment {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  status: SegmentStatus;
  memberCount: number;
  updatedAt: number;
  createdBy: string;
  conditions: string[];
  groupLogic: GroupLogic;
  relationToNextGroup?: GroupRelation;
  secondaryConditions?: string[];
  secondaryGroupLogic?: GroupLogic;
  nestedLevel: 1 | 2 | 3;
  referencedBy: number;
  ageDays: number;
}

export interface SegmentEditorPayload {
  name: string;
  description?: string;
  type: SegmentType;
  groupLogic: GroupLogic;
  conditions: string[];
  relationToNextGroup?: GroupRelation;
  secondaryConditions?: string[];
  secondaryGroupLogic?: GroupLogic;
  nestedLevel: 1 | 2 | 3;
  estimatedCount: number;
}

export interface ExportJob {
  id: string;
  source: string;
  rowCount: number;
  fields: string[];
  includePII: boolean;
  createdAt: number;
  expiresAt: number;
}

export const now = () => Date.now();

export const formatRelative = (timestamp: number) => {
  const diffMin = Math.floor((now() - timestamp) / 60000);
  if (diffMin < 1) return '剛剛';
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小時前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} 天前`;
};

export const countConditions = (segment: Pick<Segment, 'conditions' | 'secondaryConditions'>) =>
  segment.conditions.length + (segment.secondaryConditions?.length ?? 0);

export const defaultSegments: Segment[] = [
  {
    id: 's1',
    name: '糖尿病活躍讀者',
    description: '近 7 天閱讀糖尿病內容達 3 次以上',
    type: 'dynamic',
    status: 'active',
    memberCount: 12350,
    updatedAt: now() - 2 * 60000,
    createdBy: '張小明',
    conditions: [
      '用戶屬性｜興趣偏好｜包含｜糖尿病',
      '行為｜page_view(content_category=糖尿病)｜≥ 3 次｜近 7 天',
    ],
    groupLogic: 'AND',
    nestedLevel: 2,
    referencedBy: 3,
    ageDays: 12,
  },
  {
    id: 's2',
    name: 'App 開啟但不點推播',
    description: '近 7 天有開 App，近 30 天未點推播',
    type: 'dynamic',
    status: 'active',
    memberCount: 8200,
    updatedAt: now() - 15 * 60000,
    createdBy: '李美華',
    conditions: ['行為｜app_open｜≥ 1 次｜近 7 天'],
    groupLogic: 'AND',
    relationToNextGroup: 'AND NOT',
    secondaryConditions: ['行為｜notification_click｜≥ 1 次｜近 30 天'],
    secondaryGroupLogic: 'AND',
    nestedLevel: 3,
    referencedBy: 0,
    ageDays: 5,
  },
  {
    id: 's3',
    name: '2026 Q1 活動快照',
    description: '一次性活動名單快照',
    type: 'static',
    status: 'active',
    memberCount: 45600,
    updatedAt: now() - 3 * 24 * 60 * 60000,
    createdBy: '王大明',
    conditions: [
      '用戶屬性｜registration_brand｜=｜supertaste',
      '用戶屬性｜registration_date｜介於｜2026-03-01 ~ 2026-03-31',
    ],
    groupLogic: 'AND',
    nestedLevel: 1,
    referencedBy: 0,
    ageDays: 66,
  },
  {
    id: 's4',
    name: 'iOS 推播已開啟用戶',
    description: 'iOS 且推播權限為是',
    type: 'dynamic',
    status: 'paused',
    memberCount: 23400,
    updatedAt: now() - 7 * 24 * 60 * 60000,
    createdBy: '陳小華',
    conditions: ['用戶屬性｜platform｜=｜ios', '用戶屬性｜channel_opt_in.push｜=｜是'],
    groupLogic: 'AND',
    nestedLevel: 1,
    referencedBy: 1,
    ageDays: 40,
  },
];
