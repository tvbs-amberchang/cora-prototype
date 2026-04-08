import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  GitBranch,
  MessageSquare,
  MoreVertical,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Square,
  Tag,
  Trash2,
  Workflow,
  X } from
'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps } from
'@xyflow/react';
import '@xyflow/react/dist/style.css';
type JourneyStatus = 'draft' | 'active' | 'paused' | 'ended';
type TriggerType = 'event' | 'attribute' | 'schedule' | 'segment_enter';
interface Journey {
  id: string;
  name: string;
  triggerType: TriggerType;
  status: JourneyStatus;
  enteredCount: number;
  inProgressCount: number;
  completedCount: number;
  failedCount: number;
  updatedAt: string;
  startedAt?: string;
}
interface JourneyNodeData {
  nodeType: string;
  title: string;
  subtitle: string;
  stats?: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  configured?: boolean;
  templateReady?: boolean;
  segmentReady?: boolean;
}

const mockJourneys: Journey[] = [
{
  id: '1',
  name: '沉睡用戶喚醒 (Push -> LINE降級)',
  triggerType: 'segment_enter',
  status: 'active',
  enteredCount: 1200,
  inProgressCount: 578,
  completedCount: 600,
  failedCount: 22,
  updatedAt: '10 分鐘前',
  startedAt: '2026-04-01 09:00'
},
{
  id: '2',
  name: '新註冊歡迎旅程 (3天)',
  triggerType: 'event',
  status: 'active',
  enteredCount: 8500,
  inProgressCount: 1200,
  completedCount: 7200,
  failedCount: 100,
  updatedAt: '1 小時前',
  startedAt: '2026-03-20 10:00'
},
{
  id: '3',
  name: '食尚玩家抽獎未中獎安撫',
  triggerType: 'event',
  status: 'draft',
  enteredCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  failedCount: 0,
  updatedAt: '2 天前'
},
{
  id: '4',
  name: '2025 雙11 預熱推播',
  triggerType: 'schedule',
  status: 'ended',
  enteredCount: 45000,
  inProgressCount: 0,
  completedCount: 44500,
  failedCount: 500,
  updatedAt: '3 個月前'
}];

const StatusBadge = ({ status }: {status: JourneyStatus;}) => {
  const config = {
    draft: {
      label: '草稿',
      color: 'bg-slate-100 text-slate-600'
    },
    active: {
      label: '啟用中',
      color: 'bg-green-100 text-green-700'
    },
    paused: {
      label: '已暫停',
      color: 'bg-yellow-100 text-yellow-700'
    },
    ended: {
      label: '已結束',
      color: 'bg-slate-100 text-slate-500'
    }
  };
  const { label, color } = config[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>);

};
const TriggerBadge = ({ triggerType }: {triggerType: TriggerType;}) => {
  const label =
  triggerType === 'event' ? '行為觸發' :
  triggerType === 'attribute' ? '屬性觸發' :
  triggerType === 'schedule' ? '排程觸發' :
  '分群進入觸發';
  return <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">{label}</span>;
};
// --- Canvas Components ---
const NodeIcon = ({ type }: {type: string;}) => {
  switch (type) {
    case 'trigger':
      return <Play className="w-4 h-4 text-slate-700" />;
    case 'action_message':
      return <MessageSquare className="w-4 h-4 text-slate-700" />;
    case 'action_tag':
      return <Tag className="w-4 h-4 text-slate-700" />;
    case 'wait':
      return <Clock className="w-4 h-4 text-slate-700" />;
    case 'condition':
      return <GitBranch className="w-4 h-4 text-slate-700" />;
    case 'behavior':
      return <MousePointerClick className="w-4 h-4 text-slate-700" />;
    case 'end':
      return <Square className="w-4 h-4 text-slate-400" />;
    default:
      return <Settings className="w-4 h-4 text-slate-600" />;
  }
};
const getNodeColor = (type: string) => {
  switch (type) {
    case 'trigger':
      return 'bg-blue-500';
    case 'action_message':
      return 'bg-green-500';
    case 'action_tag':
      return 'bg-purple-500';
    case 'wait':
      return 'bg-orange-400';
    case 'condition':
      return 'bg-indigo-500';
    case 'behavior':
      return 'bg-teal-500';
    case 'end':
      return 'bg-slate-300';
    default:
      return 'bg-slate-400';
  }
};
const CanvasNode = ({
  type,
  title,
  subtitle,
  stats,
  isConfigured = true,
  isActive = false







}: {type: string;title: string;subtitle: string;stats?: string;isConfigured?: boolean;isActive?: boolean;}) => {
  const accentColor = getNodeColor(type);
  return (
    <div
      className={`relative w-[280px] bg-white rounded-md transition-all cursor-pointer group flex flex-col ${isActive ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border border-slate-300 shadow-sm hover:border-slate-400'} ${!isConfigured ? 'border-dashed border-red-400' : ''}`}>
      
      {/* Left Accent Line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${accentColor}`}>
      </div>

      <div className="p-3 pl-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-slate-100 rounded border border-slate-200">
              <NodeIcon type={type} />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 font-mono tracking-tight">
              {title}
            </h4>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          {subtitle}
        </p>

        {stats &&
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              {stats}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        }
      </div>

      {!isConfigured &&
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
      }
    </div>);

};
const ChevronRight = ({ className }: {className?: string;}) =>
<svg
  className={className}
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24">
  
    <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    d="M9 5l7 7-7 7">
  </path>
  </svg>;

// --- React Flow Custom Node ---
const CustomFlowNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as JourneyNodeData;
  return (
    <>
      {nodeData.hasInput &&
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />

      }
      <CanvasNode
        type={nodeData.nodeType}
        title={nodeData.title}
        subtitle={nodeData.subtitle}
        stats={nodeData.stats}
        isConfigured={nodeData.configured !== false}
        isActive={selected} />
      
      {nodeData.hasOutput &&
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />

      }
    </>);

};
const nodeTypes = {
  custom: CustomFlowNode
};
// --- React Flow Initial Data ---
const initialNodesSeed: Node<JourneyNodeData>[] = [
{
  id: '1',
  type: 'custom',
  position: {
    x: 400,
    y: 50
  },
  data: {
    nodeType: 'trigger',
    title: '分群進入觸發',
    subtitle: '用戶進入「沉睡用戶 (30天未活躍)」分群',
    stats: '1,200 人進入',
    hasOutput: true,
    configured: true
  }
},
{
  id: '2',
  type: 'custom',
  position: {
    x: 400,
    y: 200
  },
  data: {
    nodeType: 'condition',
    title: '條件判斷：有 Push opt-in？',
    subtitle: '檢查用戶是否開啟 App 推播權限',
    hasInput: true,
    hasOutput: true,
    configured: true
  }
},
{
  id: '3',
  type: 'custom',
  position: {
    x: 200,
    y: 350
  },
  data: {
    nodeType: 'action_message',
    title: '發送 App Push',
    subtitle: '範本：[喚醒] 專屬健康報告已生成',
    stats: '850 發 / 823 送達',
    hasInput: true,
    hasOutput: true,
    configured: true,
    templateReady: true
  }
},
{
  id: '4',
  type: 'custom',
  position: {
    x: 600,
    y: 350
  },
  data: {
    nodeType: 'action_message',
    title: '發送 LINE 訊息',
    subtitle: '範本：[喚醒] LINE 專屬點數發送',
    stats: '350 發 / 341 送達',
    hasInput: true,
    hasOutput: true,
    configured: true,
    templateReady: true
  }
},
{
  id: '5',
  type: 'custom',
  position: {
    x: 200,
    y: 500
  },
  data: {
    nodeType: 'behavior',
    title: '行為判斷：24hr 內回訪？',
    subtitle: '等待事件：app_open',
    hasInput: true,
    hasOutput: true,
    configured: true
  }
},
{
  id: '6',
  type: 'custom',
  position: {
    x: 600,
    y: 500
  },
  data: {
    nodeType: 'end',
    title: '結束旅程',
    subtitle: '降級觸達完畢',
    stats: '350 完成',
    hasInput: true,
    configured: true
  }
},
{
  id: '7',
  type: 'custom',
  position: {
    x: 50,
    y: 650
  },
  data: {
    nodeType: 'end',
    title: '結束旅程',
    subtitle: '喚醒成功',
    stats: '245 完成',
    hasInput: true,
    configured: true
  }
},
{
  id: '8',
  type: 'custom',
  position: {
    x: 350,
    y: 650
  },
  data: {
    nodeType: 'action_message',
    title: '發送 LINE 訊息',
    subtitle: '範本：[喚醒] LINE 專屬點數發送',
    stats: '578 發 / 550 送達',
    hasInput: true,
    hasOutput: true,
    configured: true,
    templateReady: true
  }
},
{
  id: '9',
  type: 'custom',
  position: {
    x: 350,
    y: 800
  },
  data: {
    nodeType: 'end',
    title: '結束旅程',
    subtitle: '降級觸達完畢',
    stats: '578 完成',
    hasInput: true,
    configured: true
  }
}];

const initialEdgesSeed: Edge[] = [
{
  id: 'e1-2',
  source: '1',
  target: '2',
  type: 'bezier',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94a3b8'
  }
},
{
  id: 'e2-3',
  source: '2',
  target: '3',
  type: 'bezier',
  label: 'Yes (850)',
  labelStyle: {
    fill: '#15803d',
    fontWeight: 700,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  labelBgStyle: {
    fill: '#dcfce7',
    stroke: '#bbf7d0'
  },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 4,
  style: {
    stroke: '#22c55e',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#22c55e'
  }
},
{
  id: 'e2-4',
  source: '2',
  target: '4',
  type: 'bezier',
  label: 'No (350)',
  labelStyle: {
    fill: '#b91c1c',
    fontWeight: 700,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  labelBgStyle: {
    fill: '#fee2e2',
    stroke: '#fecaca'
  },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 4,
  style: {
    stroke: '#ef4444',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#ef4444'
  }
},
{
  id: 'e3-5',
  source: '3',
  target: '5',
  type: 'bezier',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94a3b8'
  }
},
{
  id: 'e4-6',
  source: '4',
  target: '6',
  type: 'bezier',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94a3b8'
  }
},
{
  id: 'e5-7',
  source: '5',
  target: '7',
  type: 'bezier',
  label: 'Yes (245)',
  labelStyle: {
    fill: '#15803d',
    fontWeight: 700,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  labelBgStyle: {
    fill: '#dcfce7',
    stroke: '#bbf7d0'
  },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 4,
  style: {
    stroke: '#22c55e',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#22c55e'
  }
},
{
  id: 'e5-8',
  source: '5',
  target: '8',
  type: 'bezier',
  label: 'No (578)',
  labelStyle: {
    fill: '#b91c1c',
    fontWeight: 700,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  labelBgStyle: {
    fill: '#fee2e2',
    stroke: '#fecaca'
  },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 4,
  style: {
    stroke: '#ef4444',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#ef4444'
  }
},
{
  id: 'e8-9',
  source: '8',
  target: '9',
  type: 'bezier',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94a3b8'
  }
}];

// --- Main Component ---
export default function Journeys() {
  const [journeys, setJourneys] = useState<Journey[]>(mockJourneys);
  const [view, setView] = useState<'list' | 'setup' | 'canvas'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | 'all'>('all');
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [setupName, setSetupName] = useState('');
  const [setupTriggerType, setSetupTriggerType] = useState<TriggerType>('event');
  const [setupEntrySegment, setSetupEntrySegment] = useState('高互動會員');
  const [setupDescription, setSetupDescription] = useState('');
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const makeInitialNodes = useCallback(
    (): Node<JourneyNodeData>[] =>
    initialNodesSeed.map((node) => ({
      ...node,
      position: { ...node.position },
      data: { ...node.data }
    })),
    []
  );
  const makeInitialEdges = useCallback(
    (): Edge[] =>
    initialEdgesSeed.map((edge) => ({
      ...edge,
      style: edge.style ? { ...edge.style } : undefined,
      markerEnd: edge.markerEnd ? { ...edge.markerEnd } : undefined
    })),
    []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<JourneyNodeData>(makeInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(makeInitialEdges());
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<JourneyNodeData>) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setShowNodePanel(true);
    setShowAddMenu(false);
  }, []);
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setShowNodePanel(false);
    setShowAddMenu(false);
  }, []);
  const handleAddNode = (type: string, title: string) => {
    const newNodeId = `node_${Date.now()}`;
    // Find position: if a node is selected, place it below that node. Otherwise, place it at the bottom.
    let newY = 950;
    let newX = 400;
    let sourceId = '9'; // Default to the last node if nothing selected
    if (selectedNodeId) {
      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      if (selectedNode) {
        newX = selectedNode.position.x;
        newY = selectedNode.position.y + 150;
        sourceId = selectedNode.id;
      }
    } else {
      // Find the lowest node
      const lowestNode = nodes.reduce((prev, current) =>
      prev.position.y > current.position.y ? prev : current
      );
      newY = lowestNode.position.y + 150;
      newX = lowestNode.position.x;
      sourceId = lowestNode.id;
    }
    const newNode: Node<JourneyNodeData> = {
      id: newNodeId,
      type: 'custom',
      position: {
        x: newX,
        y: newY
      },
      data: {
        nodeType: type,
        title: title,
        subtitle: '新建立的節點，請點擊設定',
        hasInput: true,
        hasOutput: true,
        configured: false
      }
    };
    const newEdge = {
      id: `e${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      type: 'bezier',
      style: {
        stroke: '#94a3b8',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8'
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setShowAddMenu(false);
    setSelectedNodeId(newNodeId);
    setShowNodePanel(true);
  };
  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    // Remove the node
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    // Remove any edges connected to this node
    setEdges((eds) =>
    eds.filter(
      (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
    )
    );
    // Close panel
    setShowNodePanel(false);
    setSelectedNodeId(null);
  };
  const filteredJourneys = journeys.filter((journey) => {
    const matchesSearch = journey.name.
    toLowerCase().
    includes(searchQuery.toLowerCase());
    const matchesStatus =
    statusFilter === 'all' || journey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const openSetup = (journey?: Journey) => {
    const draftJourney: Journey =
    journey ??
    {
      id: `draft_${Date.now()}`,
      name: `新旅程 ${journeys.length + 1}`,
      triggerType: 'event',
      status: 'draft',
      enteredCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      failedCount: 0,
      updatedAt: '剛剛'
    };
    setSelectedJourney(draftJourney);
    setSetupName(draftJourney.name);
    setSetupTriggerType(draftJourney.triggerType);
    setSetupEntrySegment('高互動會員');
    setSetupDescription('');
    setView('setup');
  };
  const openCanvas = (journey: Journey) => {
    setSelectedJourney(journey);
    // 每次打開畫布都重載預設範本，避免前一次操作把節點刪光造成白畫布。
    setNodes(makeInitialNodes());
    setEdges(makeInitialEdges());
    setSelectedNodeId(null);
    setShowNodePanel(false);
    setShowAddMenu(false);
    setValidationMessage(null);
    setValidationWarnings([]);
    setView('canvas');
  };
  const saveSetupAndOpenCanvas = () => {
    const trimmedName = setupName.trim();
    if (!trimmedName) {
      alert('請先輸入旅程名稱。');
      return;
    }
    const baseJourney = selectedJourney ??
    {
      id: `draft_${Date.now()}`,
      name: trimmedName,
      triggerType: setupTriggerType,
      status: 'draft' as JourneyStatus,
      enteredCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      failedCount: 0,
      updatedAt: '剛剛'
    };
    const nextJourney: Journey = {
      ...baseJourney,
      name: trimmedName,
      triggerType: setupTriggerType,
      status: baseJourney.status === 'ended' ? 'draft' : baseJourney.status,
      updatedAt: '剛剛'
    };
    setJourneys((prev) => {
      const exists = prev.some((journey) => journey.id === nextJourney.id);
      if (exists) {
        return prev.map((journey) => journey.id === nextJourney.id ? nextJourney : journey);
      }
      return [nextJourney, ...prev];
    });
    openCanvas(nextJourney);
  };
  useEffect(() => {
    if (view === 'canvas' && nodes.length === 0) {
      setNodes(makeInitialNodes());
      setEdges(makeInitialEdges());
      setValidationMessage('偵測到空白畫布，已自動還原預設範本。');
    }
  }, [edges.length, makeInitialEdges, makeInitialNodes, nodes.length, setEdges, setNodes, view]);
  const getSelectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const runActivationChecks = () => {
    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    const triggerCount = nodes.filter((node) => node.data.nodeType === 'trigger').length;
    if (triggerCount === 0) blockingIssues.push('缺少觸發入口節點。');
    const unconfiguredActions = nodes.filter(
      (node) =>
      (node.data.nodeType === 'action_message' || node.data.nodeType === 'action_tag') &&
      node.data.configured === false
    );
    if (unconfiguredActions.length > 0) {
      blockingIssues.push(`有 ${unconfiguredActions.length} 個動作節點尚未完成設定。`);
    }
    const isolatedNodes = nodes.filter((node) => {
      if (node.data.nodeType === 'trigger') return false;
      return !edges.some((edge) => edge.source === node.id || edge.target === node.id);
    });
    if (isolatedNodes.length > 0) {
      blockingIssues.push(`有 ${isolatedNodes.length} 個孤立節點尚未連線。`);
    }
    nodes.forEach((node) => {
      if (node.data.templateReady === false) warnings.push(`節點「${node.data.title}」引用的訊息範本狀態非可用。`);
      if (node.data.segmentReady === false) warnings.push(`節點「${node.data.title}」引用的分群狀態非啟用中。`);
    });
    if (nodes.length > 30) {
      blockingIssues.push('單一旅程節點超過 30 個。');
    }
    if (blockingIssues.length > 0) {
      setValidationMessage(`啟用失敗：${blockingIssues.join(' ')}`);
      setValidationWarnings(warnings);
      return false;
    }
    if (journeys.filter((item) => item.status === 'active').length >= 50 && selectedJourney?.status !== 'active') {
      setValidationMessage('啟用失敗：同時啟用旅程已達上限 50 條。');
      setValidationWarnings(warnings);
      return false;
    }
    setValidationMessage('啟用前檢查通過。');
    setValidationWarnings(warnings);
    return true;
  };

  const updateSelectedJourneyStatus = (status: JourneyStatus) => {
    if (!selectedJourney) return;
    setJourneys((prev) =>
    prev.map((journey) =>
      journey.id === selectedJourney.id ? { ...journey, status, updatedAt: '剛剛', startedAt: journey.startedAt ?? '2026-04-08 12:00' } : journey
    )
    );
    setSelectedJourney((prev) => prev ? { ...prev, status, updatedAt: '剛剛', startedAt: prev.startedAt ?? '2026-04-08 12:00' } : prev);
  };

  const activateJourney = () => {
    if (runActivationChecks()) {
      updateSelectedJourneyStatus('active');
    }
  };
  if (view === 'setup' && selectedJourney) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 mb-3">
            <ChevronLeft className="w-4 h-4" />
            <span>返回旅程列表</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">建立旅程 - 基本設定</h1>
          <p className="text-slate-500">先完成觸發與基本資訊，再進入畫布編排節點。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">旅程名稱</label>
            <input
              type="text"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="例如：新註冊 7 日培養旅程"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">觸發類型</label>
            <select
              value={setupTriggerType}
              onChange={(e) => setSetupTriggerType(e.target.value as TriggerType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="event">行為觸發</option>
              <option value="attribute">屬性觸發</option>
              <option value="schedule">排程觸發</option>
              <option value="segment_enter">分群進入觸發</option>
            </select>
          </div>
          {setupTriggerType === 'segment_enter' &&
          <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">進入分群</label>
              <input
              type="text"
              value={setupEntrySegment}
              onChange={(e) => setSetupEntrySegment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                啟用時會建立此分群的基線快照，後續以「進入後變化」計算進件，避免回溯舊成員。
              </p>
            </div>
          }
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">說明（選填）</label>
            <textarea
              rows={3}
              value={setupDescription}
              onChange={(e) => setSetupDescription(e.target.value)}
              placeholder="描述這條旅程的目的與成功指標"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
              取消
            </button>
            <button
              onClick={saveSetupAndOpenCanvas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              儲存並進入畫布
            </button>
          </div>
        </div>
      </div>);
  }
  if (view === 'canvas' && selectedJourney) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8 bg-[#f4f5f7] font-sans relative overflow-hidden">
        {/* Canvas Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setView('list')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors border border-transparent hover:border-slate-200">
              
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-3">
              <h1 className="text-sm font-semibold text-slate-900">
                {selectedJourney.name}
              </h1>
              <StatusBadge status={selectedJourney.status} />
              <TriggerBadge triggerType={selectedJourney.triggerType} />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs text-slate-500 mr-2 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">
              進入:{' '}
              <span className="font-bold text-slate-900">
                {selectedJourney.enteredCount.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setValidationMessage('草稿已儲存（示意）。')}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-medium text-xs bg-white shadow-sm">
              儲存草稿
            </button>
            <button
              onClick={() => {
                setNodes(makeInitialNodes());
                setEdges(makeInitialEdges());
                setSelectedNodeId(null);
                setShowNodePanel(false);
                setShowAddMenu(false);
                setValidationMessage('已還原預設旅程範本。');
              }}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-medium text-xs bg-white shadow-sm">
              還原範本
            </button>
            {selectedJourney.status === 'draft' ?
            <button className="px-3 py-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm">
                <Play className="w-3 h-3" onClick={activateJourney} />
                <span onClick={activateJourney}>啟用旅程</span>
              </button> :
            selectedJourney.status === 'active' ?
            <button
              onClick={() => updateSelectedJourneyStatus('paused')}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm">
                <Pause className="w-3 h-3" />
                <span>暫停旅程</span>
              </button> :
            selectedJourney.status === 'paused' ?
            <button
              onClick={() => updateSelectedJourneyStatus('active')}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm">
                <Play className="w-3 h-3" />
                <span>恢復旅程</span>
              </button> :
            <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-500 rounded font-medium text-xs">
                已結束
              </button>
            }
            {selectedJourney.status !== 'ended' &&
            <button
              onClick={() => updateSelectedJourneyStatus('ended')}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded hover:bg-red-50 transition-colors font-medium text-xs shadow-sm">
                終止旅程
              </button>
            }
          </div>
        </div>
        {(validationMessage || validationWarnings.length > 0) &&
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 space-y-1">
            {validationMessage &&
            <div className={`text-xs ${validationMessage.includes('失敗') ? 'text-red-700' : 'text-green-700'}`}>
                {validationMessage}
              </div>
            }
            {validationWarnings.map((warning) =>
          <div key={warning} className="text-xs text-amber-700">
                ⚠ {warning}
              </div>
          )}
          </div>
        }

        {/* Main Workspace Area (Canvas + Panel) */}
        <div className="flex-1 flex overflow-hidden">
          {/* React Flow Canvas Area */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              fitView
              fitViewOptions={{
                padding: 0.2
              }}
              minZoom={0.5}
              maxZoom={1.5}
              className="bg-[#f4f5f7]">
              
              <Background color="#cbd5e1" gap={24} size={1.5} />
              <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-md" />
            </ReactFlow>

            {/* Floating Action Button */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
              {showAddMenu &&
              <div className="mb-4 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden w-48 animate-in slide-in-from-bottom-2">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    新增節點
                  </div>
                  <div className="p-1">
                    <button
                    onClick={() =>
                    handleAddNode('action_message', '發送訊息')
                    }
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center space-x-2">
                    
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>發送訊息 (Action)</span>
                    </button>
                    <button
                    onClick={() => handleAddNode('wait', '等待時間')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center space-x-2">
                    
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>等待時間 (Wait)</span>
                    </button>
                    <button
                    onClick={() => handleAddNode('condition', '條件判斷')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center space-x-2">
                    
                      <GitBranch className="w-4 h-4 text-indigo-500" />
                      <span>條件判斷 (Condition)</span>
                    </button>
                    <button
                    onClick={() => handleAddNode('behavior', '用戶行為判斷')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center space-x-2">
                      <MousePointerClick className="w-4 h-4 text-teal-500" />
                      <span>用戶行為判斷</span>
                    </button>
                    <button
                    onClick={() => handleAddNode('action_tag', '更新標籤')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-purple-500" />
                      <span>更新標籤</span>
                    </button>
                  </div>
                </div>
              }
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`w-12 h-12 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${showAddMenu ? 'bg-slate-700 rotate-45' : 'bg-slate-900'}`}>
                
                <Plus className="w-5 h-5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Node Configuration Panel (Right Sidebar) */}
          {showNodePanel &&
          <div className="w-[400px] bg-white border-l border-slate-200 shadow-xl flex flex-col z-30 flex-shrink-0 animate-in slide-in-from-right duration-200">
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900 font-mono">
                  節點設定
                </h3>
                <button
                onClick={() => setShowNodePanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600">
                  限制：單一旅程最多 30 節點，不支援合流/迴圈/並行。<br />
                  啟用上限：同時啟用旅程最多 50 條。<br />
                  等待/超時節點精度：±1 分鐘。
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    節點名稱
                  </label>
                  <input
                  type="text"
                  value={getSelectedNode?.data.title ?? ''}
                  onChange={(e) =>
                  getSelectedNode &&
                  setNodes((prev) =>
                    prev.map((node) =>
                      node.id === getSelectedNode.id ? { ...node, data: { ...node.data, title: e.target.value } } : node
                    )
                  )
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    選擇發送渠道
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                    <option>App Push</option>
                    <option>LINE</option>
                    <option>SMS</option>
                    <option>Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    節點設定完成
                  </label>
                  <label className="flex items-center justify-between border border-slate-300 rounded px-3 py-2 text-sm">
                    <span>configured</span>
                    <input
                      type="checkbox"
                      checked={getSelectedNode?.data.configured !== false}
                      onChange={(e) =>
                      getSelectedNode &&
                      setNodes((prev) =>
                        prev.map((node) =>
                          node.id === getSelectedNode.id ?
                          { ...node, data: { ...node.data, configured: e.target.checked } } :
                          node
                        )
                      )
                      } />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    選擇訊息範本
                  </label>
                  <div className="border border-slate-300 rounded p-2.5 bg-slate-50 flex justify-between items-center group cursor-pointer hover:border-slate-400">
                    <span className="text-sm text-slate-700 font-medium">
                      [喚醒] 專屬健康報告已生成
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-blue-600 font-medium">
                      更換
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                    節點報表
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                        發送數
                      </div>
                      <div className="text-lg font-mono text-slate-900">
                        {getSelectedNode?.data.nodeType === 'action_message' ? '850' : '-'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                        送達數
                      </div>
                      <div className="text-lg font-mono text-slate-900">
                        {getSelectedNode?.data.nodeType === 'action_message' ?
                        <>
                            823{' '}
                            <span className="text-xs font-sans text-slate-400 ml-1">
                              96%
                            </span>
                          </> :
                        '-'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                        開啟數
                      </div>
                      <div className="text-lg font-mono text-slate-900">
                        {getSelectedNode?.data.nodeType === 'action_message' ?
                        <>
                            312{' '}
                            <span className="text-xs font-sans text-slate-400 ml-1">
                              37%
                            </span>
                          </> :
                        '-'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                        節點失敗
                      </div>
                      <div className="text-lg font-mono text-red-600">
                        {getSelectedNode?.data.nodeType === 'action_message' ? '27' : '0'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                <button
                onClick={handleDeleteNode}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                title="刪除節點">
                
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-medium">刪除</span>
                </button>
                <div className="flex space-x-2">
                  <button
                  onClick={() => setShowNodePanel(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium rounded hover:bg-slate-200 transition-colors">
                  
                    取消
                  </button>
                  <button
                  onClick={() => setShowNodePanel(false)}
                  className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 font-medium transition-colors shadow-sm">
                  
                    儲存設定
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>);

  }
  // --- List View ---
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          自動化旅程 (Journey Engine)
        </h1>
        <p className="text-slate-500">
          視覺化編排用戶行銷旅程，在對的時機觸發對的動作
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <button
            onClick={() => openSetup()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>建立旅程</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋旅程名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
              setStatusFilter(e.target.value as JourneyStatus | 'all')
              }
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              
              <option value="all">全部狀態</option>
              <option value="active">啟用中</option>
              <option value="draft">草稿</option>
              <option value="paused">已暫停</option>
              <option value="ended">已結束</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">
                  旅程名稱
                </th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium text-right">總進入</th>
                <th className="px-4 py-3 font-medium text-right">目前在途</th>
                <th className="px-4 py-3 font-medium text-right">已完成</th>
                <th className="px-4 py-3 font-medium">最後更新</th>
                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJourneys.map((journey) =>
              <tr
                key={journey.id}
                className="hover:bg-slate-50 transition-colors group">
                
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900 flex items-center space-x-2">
                      <Workflow className="w-4 h-4 text-slate-400" />
                      <span>{journey.name}</span>
                      <TriggerBadge triggerType={journey.triggerType} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={journey.status} />
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900">
                    {journey.enteredCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-blue-600 font-medium">
                    {journey.inProgressCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-green-600 font-medium">
                    {journey.completedCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {journey.updatedAt}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      {journey.status === 'draft' &&
                      <button
                        onClick={() => openSetup(journey)}
                        className="text-slate-700 hover:text-slate-900 font-medium px-3 py-1.5 rounded hover:bg-slate-100 transition-colors">
                        設定旅程
                      </button>
                      }
                      <button
                        onClick={() => openCanvas(journey)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                        開啟畫布
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredJourneys.length === 0 &&
          <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">找不到符合條件的旅程</p>
            </div>
          }
        </div>
      </div>
    </div>);

}