// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: React Flow journey canvas — moved from Journeys.tsx with minimal changes

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Clock,
  GitBranch,
  MessageSquare,
  MoreVertical,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Settings,
  Square,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
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
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Journey } from './JourneyList';

type JourneyStatus = 'draft' | 'active' | 'paused' | 'ended';

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

// ---- Status / Trigger badges (canvas header uses these) ----
const StatusBadge = ({ status }: { status: JourneyStatus }) => {
  const config: Record<JourneyStatus, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
    active: { label: '啟用中', color: 'bg-green-100 text-green-700' },
    paused: { label: '已暫停', color: 'bg-yellow-100 text-yellow-700' },
    ended: { label: '已結束', color: 'bg-slate-100 text-slate-500' },
  };
  const { label, color } = config[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const TriggerBadge = ({ triggerType }: { triggerType: Journey['triggerType'] }) => {
  const label =
    triggerType === 'event' ? '行為觸發' :
    triggerType === 'attribute' ? '屬性觸發' :
    triggerType === 'schedule' ? '排程觸發' :
    '分群進入觸發';
  return (
    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
      {label}
    </span>
  );
};

// ---- Canvas node rendering (unchanged from original) ----
const NodeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'trigger': return <Play className="w-4 h-4 text-slate-700" />;
    case 'action_message': return <MessageSquare className="w-4 h-4 text-slate-700" />;
    case 'action_tag': return <Tag className="w-4 h-4 text-slate-700" />;
    case 'wait': return <Clock className="w-4 h-4 text-slate-700" />;
    case 'condition': return <GitBranch className="w-4 h-4 text-slate-700" />;
    case 'behavior': return <MousePointerClick className="w-4 h-4 text-slate-700" />;
    case 'end': return <Square className="w-4 h-4 text-slate-400" />;
    default: return <Settings className="w-4 h-4 text-slate-600" />;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'trigger': return 'bg-brand-500';
    case 'action_message': return 'bg-green-500';
    case 'action_tag': return 'bg-purple-500';
    case 'wait': return 'bg-orange-400';
    case 'condition': return 'bg-indigo-500';
    case 'behavior': return 'bg-teal-500';
    case 'end': return 'bg-slate-300';
    default: return 'bg-slate-400';
  }
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const CanvasNode = ({
  type,
  title,
  subtitle,
  stats,
  isConfigured = true,
  isActive = false,
}: {
  type: string;
  title: string;
  subtitle: string;
  stats?: string;
  isConfigured?: boolean;
  isActive?: boolean;
}) => {
  const accentColor = getNodeColor(type);
  return (
    <div
      className={`relative w-[280px] bg-white rounded-md transition-all cursor-pointer group flex flex-col ${
        isActive
          ? 'ring-2 ring-brand-300 border-transparent shadow-md'
          : 'border border-slate-300 shadow-sm hover:border-slate-400'
      } ${!isConfigured ? 'border-dashed border-red-400' : ''}`}
    >
      {/* Left Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${accentColor}`} />

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

        <p className="text-xs text-slate-600 leading-relaxed mb-2">{subtitle}</p>

        {stats && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              {stats}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        )}
      </div>

      {!isConfigured && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
      )}
    </div>
  );
};

const CustomFlowNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as JourneyNodeData;
  return (
    <>
      {nodeData.hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white"
        />
      )}
      <CanvasNode
        type={nodeData.nodeType}
        title={nodeData.title}
        subtitle={nodeData.subtitle}
        stats={nodeData.stats}
        isConfigured={nodeData.configured !== false}
        isActive={selected}
      />
      {nodeData.hasOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white"
        />
      )}
    </>
  );
};

const nodeTypes = { custom: CustomFlowNode };

// ---- Initial nodes & edges (unchanged from original) ----
const initialNodesSeed: Node<JourneyNodeData>[] = [
  { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { nodeType: 'trigger', title: '分群進入觸發', subtitle: '用戶進入「沉睡用戶 (30天未活躍)」分群', stats: '1,200 人進入', hasOutput: true, configured: true } },
  { id: '2', type: 'custom', position: { x: 400, y: 200 }, data: { nodeType: 'condition', title: '條件判斷：有 Push opt-in？', subtitle: '檢查用戶是否開啟 App 推播權限', hasInput: true, hasOutput: true, configured: true } },
  { id: '3', type: 'custom', position: { x: 200, y: 350 }, data: { nodeType: 'action_message', title: '發送 App Push', subtitle: '範本：[喚醒] 專屬健康報告已生成', stats: '850 發 / 823 送達', hasInput: true, hasOutput: true, configured: true, templateReady: true } },
  { id: '4', type: 'custom', position: { x: 600, y: 350 }, data: { nodeType: 'action_message', title: '發送 LINE 訊息', subtitle: '範本：[喚醒] LINE 專屬點數發送', stats: '350 發 / 341 送達', hasInput: true, hasOutput: true, configured: true, templateReady: true } },
  { id: '5', type: 'custom', position: { x: 200, y: 500 }, data: { nodeType: 'behavior', title: '行為判斷：24hr 內回訪？', subtitle: '等待事件：app_open', hasInput: true, hasOutput: true, configured: true } },
  { id: '6', type: 'custom', position: { x: 600, y: 500 }, data: { nodeType: 'end', title: '結束旅程', subtitle: '降級觸達完畢', stats: '350 完成', hasInput: true, configured: true } },
  { id: '7', type: 'custom', position: { x: 50, y: 650 }, data: { nodeType: 'end', title: '結束旅程', subtitle: '喚醒成功', stats: '245 完成', hasInput: true, configured: true } },
  { id: '8', type: 'custom', position: { x: 350, y: 650 }, data: { nodeType: 'action_message', title: '發送 LINE 訊息', subtitle: '範本：[喚醒] LINE 專屬點數發送', stats: '578 發 / 550 送達', hasInput: true, hasOutput: true, configured: true, templateReady: true } },
  { id: '9', type: 'custom', position: { x: 350, y: 800 }, data: { nodeType: 'end', title: '結束旅程', subtitle: '降級觸達完畢', stats: '578 完成', hasInput: true, configured: true } },
];

const initialEdgesSeed: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'bezier', style: { stroke: '#94a3b8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', type: 'bezier', label: 'Yes (850)', labelStyle: { fill: '#15803d', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }, labelBgStyle: { fill: '#dcfce7', stroke: '#bbf7d0' }, labelBgPadding: [6, 4], labelBgBorderRadius: 4, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  { id: 'e2-4', source: '2', target: '4', type: 'bezier', label: 'No (350)', labelStyle: { fill: '#b91c1c', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }, labelBgStyle: { fill: '#fee2e2', stroke: '#fecaca' }, labelBgPadding: [6, 4], labelBgBorderRadius: 4, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e3-5', source: '3', target: '5', type: 'bezier', style: { stroke: '#94a3b8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e4-6', source: '4', target: '6', type: 'bezier', style: { stroke: '#94a3b8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e5-7', source: '5', target: '7', type: 'bezier', label: 'Yes (245)', labelStyle: { fill: '#15803d', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }, labelBgStyle: { fill: '#dcfce7', stroke: '#bbf7d0' }, labelBgPadding: [6, 4], labelBgBorderRadius: 4, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  { id: 'e5-8', source: '5', target: '8', type: 'bezier', label: 'No (578)', labelStyle: { fill: '#b91c1c', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }, labelBgStyle: { fill: '#fee2e2', stroke: '#fecaca' }, labelBgPadding: [6, 4], labelBgBorderRadius: 4, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e8-9', source: '8', target: '9', type: 'bezier', style: { stroke: '#94a3b8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
];

// ---- Props ----
interface JourneyCanvasProps {
  journey: Journey;
  onBack: () => void;
  onUpdateStatus: (status: JourneyStatus) => void;
}

export function JourneyCanvas({ journey, onBack, onUpdateStatus }: JourneyCanvasProps) {
  const makeInitialNodes = useCallback(
    (): Node<JourneyNodeData>[] =>
      initialNodesSeed.map((node) => ({ ...node, position: { ...node.position }, data: { ...node.data } })),
    []
  );
  const makeInitialEdges = useCallback(
    (): Edge[] =>
      initialEdgesSeed.map((edge) => ({
        ...edge,
        style: edge.style ? { ...edge.style } : undefined,
        markerEnd: edge.markerEnd ? { ...edge.markerEnd } : undefined,
      })),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<JourneyNodeData>(makeInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(makeInitialEdges());
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = React.useState<string[]>([]);
  const [showNodePanel, setShowNodePanel] = React.useState(false);
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);

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
    let newY = 950;
    let newX = 400;
    let sourceId = '9';
    if (selectedNodeId) {
      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      if (selectedNode) {
        newX = selectedNode.position.x;
        newY = selectedNode.position.y + 150;
        sourceId = selectedNode.id;
      }
    } else {
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
      position: { x: newX, y: newY },
      data: { nodeType: type, title, subtitle: '新建立的節點，請點擊設定', hasInput: true, hasOutput: true, configured: false },
    };
    const newEdge = {
      id: `e${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      type: 'bezier',
      style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setShowAddMenu(false);
    setSelectedNodeId(newNodeId);
    setShowNodePanel(true);
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setShowNodePanel(false);
    setSelectedNodeId(null);
  };

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
    if (unconfiguredActions.length > 0) blockingIssues.push(`有 ${unconfiguredActions.length} 個動作節點尚未完成設定。`);
    const isolatedNodes = nodes.filter((node) => {
      if (node.data.nodeType === 'trigger') return false;
      return !edges.some((edge) => edge.source === node.id || edge.target === node.id);
    });
    if (isolatedNodes.length > 0) blockingIssues.push(`有 ${isolatedNodes.length} 個孤立節點尚未連線。`);
    nodes.forEach((node) => {
      if (node.data.templateReady === false) warnings.push(`節點「${node.data.title}」引用的訊息範本狀態非可用。`);
      if (node.data.segmentReady === false) warnings.push(`節點「${node.data.title}」引用的分群狀態非啟用中。`);
    });
    if (nodes.length > 30) blockingIssues.push('單一旅程節點超過 30 個。');
    if (blockingIssues.length > 0) {
      setValidationMessage(`啟用失敗：${blockingIssues.join(' ')}`);
      setValidationWarnings(warnings);
      return false;
    }
    setValidationMessage('啟用前檢查通過。');
    setValidationWarnings(warnings);
    return true;
  };

  const activateJourney = () => {
    if (runActivationChecks()) {
      onUpdateStatus('active');
    }
  };

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(makeInitialNodes());
      setEdges(makeInitialEdges());
      setValidationMessage('偵測到空白畫布，已自動還原預設範本。');
    }
  }, [edges.length, makeInitialEdges, makeInitialNodes, nodes.length, setEdges, setNodes]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f4f5f7] font-sans relative overflow-hidden">
      {/* Canvas Header */}
      <div className="h-14 bg-white border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-ph-surface rounded text-ph-secondary transition-colors border border-transparent hover:border-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-semibold text-ph-text">{journey.name}</h1>
            <StatusBadge status={journey.status} />
            <TriggerBadge triggerType={journey.triggerType} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs text-ph-secondary mr-2 font-mono bg-ph-surface px-2 py-1 rounded border border-border">
            進入:{' '}
            <span className="font-bold text-ph-text">
              {journey.enteredCount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setValidationMessage('草稿已儲存（示意）。')}
            className="px-3 py-1.5 border border-border text-ph-text rounded-md hover:bg-ph-surface transition-colors font-medium text-xs bg-white shadow-sm"
          >
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
            className="px-3 py-1.5 border border-border text-ph-text rounded-md hover:bg-ph-surface transition-colors font-medium text-xs bg-white shadow-sm"
          >
            還原範本
          </button>
          {journey.status === 'draft' ? (
            <button
              onClick={activateJourney}
              className="px-3 py-1.5 bg-ph-text text-white rounded-md hover:bg-ph-text/90 transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Play className="w-3 h-3" />
              <span>啟用旅程</span>
            </button>
          ) : journey.status === 'active' ? (
            <button
              onClick={() => onUpdateStatus('paused')}
              className="px-3 py-1.5 bg-white border border-border text-ph-text rounded-md hover:bg-ph-surface transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Pause className="w-3 h-3" />
              <span>暫停旅程</span>
            </button>
          ) : journey.status === 'paused' ? (
            <button
              onClick={() => onUpdateStatus('active')}
              className="px-3 py-1.5 bg-white border border-border text-ph-text rounded-md hover:bg-ph-surface transition-colors font-medium text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Play className="w-3 h-3" />
              <span>恢復旅程</span>
            </button>
          ) : (
            <button className="px-3 py-1.5 bg-white border border-border text-ph-muted rounded-md font-medium text-xs">
              已結束
            </button>
          )}
          {journey.status !== 'ended' && (
            <button
              onClick={() => onUpdateStatus('ended')}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors font-medium text-xs shadow-sm"
            >
              終止旅程
            </button>
          )}
        </div>
      </div>

      {/* Validation bar */}
      {(validationMessage || validationWarnings.length > 0) && (
        <div className="px-4 py-2 border-b border-border bg-ph-surface space-y-1">
          {validationMessage && (
            <div className={`text-xs ${validationMessage.includes('失敗') ? 'text-red-700' : 'text-green-700'}`}>
              {validationMessage}
            </div>
          )}
          {validationWarnings.map((warning) => (
            <div key={warning} className="text-xs text-amber-700">
              ⚠ {warning}
            </div>
          ))}
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* React Flow Canvas (internals unchanged) */}
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
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={1.5}
            className="bg-[#f4f5f7]"
          >
            <Background color="#cbd5e1" gap={24} size={1.5} />
            <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-md" />
          </ReactFlow>

          {/* Floating Add Button */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
            {showAddMenu && (
              <div className="mb-4 bg-white rounded-lg shadow-xl border border-border overflow-hidden w-48 animate-in slide-in-from-bottom-2">
                <div className="px-3 py-2 bg-ph-surface border-b border-border text-xs font-bold text-ph-secondary uppercase tracking-wider">
                  新增節點
                </div>
                <div className="p-1">
                  <button
                    onClick={() => handleAddNode('action_message', '發送訊息')}
                    className="w-full text-left px-3 py-2 text-sm text-ph-text hover:bg-ph-surface rounded flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span>發送訊息 (Action)</span>
                  </button>
                  <button
                    onClick={() => handleAddNode('wait', '等待時間')}
                    className="w-full text-left px-3 py-2 text-sm text-ph-text hover:bg-ph-surface rounded flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>等待時間 (Wait)</span>
                  </button>
                  <button
                    onClick={() => handleAddNode('condition', '條件判斷')}
                    className="w-full text-left px-3 py-2 text-sm text-ph-text hover:bg-ph-surface rounded flex items-center space-x-2"
                  >
                    <GitBranch className="w-4 h-4 text-indigo-500" />
                    <span>條件判斷 (Condition)</span>
                  </button>
                  <button
                    onClick={() => handleAddNode('behavior', '用戶行為判斷')}
                    className="w-full text-left px-3 py-2 text-sm text-ph-text hover:bg-ph-surface rounded flex items-center space-x-2"
                  >
                    <MousePointerClick className="w-4 h-4 text-teal-500" />
                    <span>用戶行為判斷</span>
                  </button>
                  <button
                    onClick={() => handleAddNode('action_tag', '更新標籤')}
                    className="w-full text-left px-3 py-2 text-sm text-ph-text hover:bg-ph-surface rounded flex items-center space-x-2"
                  >
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span>更新標籤</span>
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`w-12 h-12 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
                showAddMenu ? 'bg-slate-700 rotate-45' : 'bg-ph-text'
              }`}
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Node Configuration Panel */}
        {showNodePanel && (
          <div className="w-[400px] bg-white border-l border-border shadow-xl flex flex-col z-30 flex-shrink-0 animate-in slide-in-from-right duration-200">
            <div className="h-14 border-b border-border flex items-center justify-between px-5 bg-ph-surface/50">
              <h3 className="text-sm font-semibold text-ph-text font-mono">節點設定</h3>
              <button
                onClick={() => setShowNodePanel(false)}
                className="p-1 text-ph-muted hover:text-ph-secondary hover:bg-ph-surface rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="bg-ph-surface border border-border rounded p-3 text-xs text-ph-secondary">
                限制：單一旅程最多 30 節點，不支援合流/迴圈/並行。<br />
                啟用上限：同時啟用旅程最多 50 條。<br />
                等待/超時節點精度：±1 分鐘。
              </div>
              <div>
                <label className="block text-xs font-semibold text-ph-text mb-1.5 uppercase tracking-wider">節點名稱</label>
                <input
                  type="text"
                  value={getSelectedNode?.data.title ?? ''}
                  onChange={(e) =>
                    getSelectedNode &&
                    setNodes((prev) =>
                      prev.map((node) =>
                        node.id === getSelectedNode.id
                          ? { ...node, data: { ...node.data, title: e.target.value } }
                          : node
                      )
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ph-text mb-1.5 uppercase tracking-wider">選擇發送渠道</label>
                <select className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-300 bg-white">
                  <option>App Push</option>
                  <option>LINE</option>
                  <option>SMS</option>
                  <option>Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ph-text mb-1.5 uppercase tracking-wider">節點設定完成</label>
                <label className="flex items-center justify-between border border-border rounded-md px-3 py-2 text-sm">
                  <span>configured</span>
                  <input
                    type="checkbox"
                    checked={getSelectedNode?.data.configured !== false}
                    onChange={(e) =>
                      getSelectedNode &&
                      setNodes((prev) =>
                        prev.map((node) =>
                          node.id === getSelectedNode.id
                            ? { ...node, data: { ...node.data, configured: e.target.checked } }
                            : node
                        )
                      )
                    }
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ph-text mb-1.5 uppercase tracking-wider">選擇訊息範本</label>
                <div className="border border-border rounded-md p-2.5 bg-ph-surface flex justify-between items-center group cursor-pointer hover:border-ph-secondary">
                  <span className="text-sm text-ph-text font-medium">[喚醒] 專屬健康報告已生成</span>
                  <span className="text-xs text-ph-muted group-hover:text-brand-500 font-medium">更換</span>
                </div>
              </div>
              <div className="pt-5 border-t border-border">
                <h4 className="text-xs font-semibold text-ph-text mb-3 uppercase tracking-wider">節點報表</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-border shadow-sm">
                    <div className="text-[10px] font-semibold text-ph-secondary mb-1 uppercase">發送數</div>
                    <div className="text-lg font-mono text-ph-text">
                      {getSelectedNode?.data.nodeType === 'action_message' ? '850' : '-'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-border shadow-sm">
                    <div className="text-[10px] font-semibold text-ph-secondary mb-1 uppercase">送達數</div>
                    <div className="text-lg font-mono text-ph-text">
                      {getSelectedNode?.data.nodeType === 'action_message' ? (
                        <>823 <span className="text-xs font-sans text-ph-muted ml-1">96%</span></>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-border shadow-sm">
                    <div className="text-[10px] font-semibold text-ph-secondary mb-1 uppercase">開啟數</div>
                    <div className="text-lg font-mono text-ph-text">
                      {getSelectedNode?.data.nodeType === 'action_message' ? (
                        <>312 <span className="text-xs font-sans text-ph-muted ml-1">37%</span></>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-border shadow-sm">
                    <div className="text-[10px] font-semibold text-ph-secondary mb-1 uppercase">節點失敗</div>
                    <div className="text-lg font-mono text-red-600">
                      {getSelectedNode?.data.nodeType === 'action_message' ? '27' : '0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-ph-surface flex justify-between items-center">
              <button
                onClick={handleDeleteNode}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                title="刪除節點"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium">刪除</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNodePanel(false)}
                  className="px-3 py-1.5 text-sm text-ph-secondary hover:text-ph-text font-medium rounded-md hover:bg-ph-surface transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowNodePanel(false)}
                  className="px-3 py-1.5 text-sm bg-ph-text text-white rounded-md hover:bg-ph-text/90 font-medium transition-colors shadow-sm"
                >
                  儲存設定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
