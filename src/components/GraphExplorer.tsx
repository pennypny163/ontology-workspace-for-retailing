import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search, Filter, RefreshCw, Maximize2, ZoomIn, ZoomOut, Loader,
  AlertCircle, X, ChevronRight, ChevronDown, Tag, Clock, User,
  ExternalLink, Calculator, Link2, Shield, ArrowRight, Minimize2,
  Building2, ShoppingCart, Users, AlertTriangle, Cpu, Database,
  Play, Award, BookOpen, Target, BarChart3, Eye, Layers, GitBranch,
  Info, CheckCircle, XCircle, MousePointer
} from 'lucide-react';
import {
  GraphNode, GraphEdge, GraphData, GraphStats, RelationDetail, OntologyObjectDetail,
  RelationTypeConfig,
  fetchGraphOverview, fetchSubgraph, fetchFilteredGraph, fetchGraphStats,
  fetchRelationDetail, fetchOntologyObjectDetail, fetchRelationTypes,
} from '../services/api';

// ============================================================
// 图标映射
// ============================================================
const iconComponents: Record<string, React.ReactNode> = {
  Building2: <Building2 size={14} />,
  ShoppingCart: <ShoppingCart size={14} />,
  Users: <Users size={14} />,
  AlertTriangle: <AlertTriangle size={14} />,
  Cpu: <Cpu size={14} />,
  Database: <Database size={14} />,
  Play: <Play size={14} />,
  Award: <Award size={14} />,
  BookOpen: <BookOpen size={14} />,
  Target: <Target size={14} />,
  BarChart3: <BarChart3 size={14} />,
};

// ============================================================
// 简易力引导布局
// ============================================================
interface LayoutNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

function forceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 120
): Map<string, { x: number; y: number }> {
  const layoutNodes: LayoutNode[] = nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const r = Math.min(width, height) * 0.3;
    return {
      id: n.id,
      x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
      y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map<string, LayoutNode>();
  layoutNodes.forEach(n => nodeMap.set(n.id, n));

  const edgeList = edges.map(e => ({
    source: nodeMap.get(e.source),
    target: nodeMap.get(e.target),
  })).filter(e => e.source && e.target);

  const repulsionStrength = 3000;
  const attractionStrength = 0.005;
  const idealLength = 160;
  const damping = 0.85;
  const maxSpeed = 8;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // 斥力
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const a = layoutNodes[i];
        const b = layoutNodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (repulsionStrength * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // 引力
    for (const edge of edgeList) {
      const s = edge.source!;
      const t = edge.target!;
      let dx = t.x - s.x;
      let dy = t.y - s.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = attractionStrength * (dist - idealLength) * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    }

    // 中心引力
    for (const n of layoutNodes) {
      n.vx += (width / 2 - n.x) * 0.001 * alpha;
      n.vy += (height / 2 - n.y) * 0.001 * alpha;
    }

    // 更新位置
    for (const n of layoutNodes) {
      n.vx *= damping;
      n.vy *= damping;
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
      n.x += n.vx;
      n.y += n.vy;
      // 边界约束
      n.x = Math.max(60, Math.min(width - 60, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    }
  }

  const result = new Map<string, { x: number; y: number }>();
  layoutNodes.forEach(n => result.set(n.id, { x: n.x, y: n.y }));
  return result;
}

// ============================================================
// 主组件
// ============================================================
interface GraphExplorerProps {
  onAssetClick?: (asset: { id: number }) => void;
}

const GraphExplorer: React.FC<GraphExplorerProps> = () => {
  // 数据状态
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [relationTypes, setRelationTypes] = useState<RelationTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 布局状态
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode] = useState<string | null>(null);

  // 交互状态
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 详情面板
  const [nodeDetail, setNodeDetail] = useState<OntologyObjectDetail | null>(null);
  const [edgeDetail, setEdgeDetail] = useState<RelationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 筛选状态
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterTypeCode, setFilterTypeCode] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRelType, setFilterRelType] = useState<string>('');
  const [filterKeyword, setFilterKeyword] = useState<string>('');

  // 视图尺寸
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 900, height: 600 });

  // 全屏
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ============================================================
  // 初始加载
  // ============================================================
  useEffect(() => {
    Promise.all([
      fetchGraphOverview(80),
      fetchGraphStats(),
      fetchRelationTypes(),
    ]).then(([gd, st, rt]) => {
      setGraphData(gd);
      setStats(st);
      setRelationTypes(rt);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  // 布局计算
  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) return;
    const pos = forceLayout(graphData.nodes, graphData.edges, svgSize.width, svgSize.height, 150);
    setPositions(pos);
  }, [graphData, svgSize]);

  // 观察容器大小
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSvgSize({ width, height });
        }
      }
    });
    obs.observe(svgContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // ============================================================
  // 节点点击 -> 加载详情
  // ============================================================
  const handleNodeClick = useCallback(async (nodeId: string) => {
    setSelectedNode(nodeId);
    setSelectedEdge(null);
    setEdgeDetail(null);
    const node = graphData?.nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDetailLoading(true);
    try {
      const detail = await fetchOntologyObjectDetail(node.objectId);
      setNodeDetail(detail);
    } catch (e: any) {
      setNodeDetail(null);
    }
    setDetailLoading(false);
  }, [graphData]);

  // 边点击
  const handleEdgeClick = useCallback(async (edgeId: string) => {
    setSelectedEdge(edgeId);
    setSelectedNode(null);
    setNodeDetail(null);
    const edge = graphData?.edges.find(e => e.id === edgeId);
    if (!edge) return;
    setDetailLoading(true);
    try {
      const detail = await fetchRelationDetail(edge.relationId);
      setEdgeDetail(detail);
    } catch (e: any) {
      setEdgeDetail(null);
    }
    setDetailLoading(false);
  }, [graphData]);

  // 节点展开（加载一跳邻居并合并）
  const handleNodeExpand = useCallback(async (nodeId: string) => {
    const node = graphData?.nodes.find(n => n.id === nodeId);
    if (!node || !graphData) return;
    if (expandedNodes.has(nodeId)) return;

    try {
      const sub = await fetchSubgraph(node.objectId, 1);
      // 合并数据
      const existingNodeIds = new Set(graphData.nodes.map(n => n.id));
      const existingEdgeIds = new Set(graphData.edges.map(e => e.id));
      const newNodes = sub.nodes.filter(n => !existingNodeIds.has(n.id));
      const newEdges = sub.edges.filter(e => !existingEdgeIds.has(e.id));

      if (newNodes.length > 0 || newEdges.length > 0) {
        setGraphData({
          ...graphData,
          nodes: [...graphData.nodes, ...newNodes],
          edges: [...graphData.edges, ...newEdges],
          meta: {
            ...graphData.meta,
            total_nodes: graphData.nodes.length + newNodes.length,
            total_edges: graphData.edges.length + newEdges.length,
          },
        });
      }
      setExpandedNodes(prev => new Set([...prev, nodeId]));
    } catch (e) {
      // 忽略
    }
  }, [graphData, expandedNodes]);

  // ============================================================
  // 筛选
  // ============================================================
  const handleApplyFilter = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    setNodeDetail(null);
    setEdgeDetail(null);
    try {
      const hasFilter = filterTypeCode || filterStatus || filterRelType || filterKeyword;
      const data = hasFilter
        ? await fetchFilteredGraph({
            object_type_code: filterTypeCode || undefined,
            status: filterStatus || undefined,
            relation_type: filterRelType || undefined,
            keyword: filterKeyword || undefined,
            limit: 80,
          })
        : await fetchGraphOverview(80);
      setGraphData(data);
      setExpandedNodes(new Set());
      setPan({ x: 0, y: 0 });
      setZoom(1);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, [filterTypeCode, filterStatus, filterRelType, filterKeyword]);

  const handleReset = useCallback(async () => {
    setFilterTypeCode('');
    setFilterStatus('');
    setFilterRelType('');
    setFilterKeyword('');
    setLoading(true);
    try {
      const data = await fetchGraphOverview(80);
      setGraphData(data);
      setExpandedNodes(new Set());
      setPan({ x: 0, y: 0 });
      setZoom(1);
      setSelectedNode(null);
      setSelectedEdge(null);
      setNodeDetail(null);
      setEdgeDetail(null);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  // ============================================================
  // 拖拽 / 缩放
  // ============================================================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !dragNode) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragNode, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNode(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(3, z * delta)));
  }, []);

  // ============================================================
  // 判断节点/边是否高亮
  // ============================================================
  const isNodeHighlighted = useCallback((nodeId: string) => {
    if (selectedNode === nodeId) return true;
    if (hoveredNode === nodeId) return true;
    if (hoveredNode && graphData) {
      return graphData.edges.some(e =>
        (e.source === hoveredNode && e.target === nodeId) ||
        (e.target === hoveredNode && e.source === nodeId)
      );
    }
    if (selectedNode && graphData) {
      return graphData.edges.some(e =>
        (e.source === selectedNode && e.target === nodeId) ||
        (e.target === selectedNode && e.source === nodeId)
      );
    }
    return false;
  }, [hoveredNode, selectedNode, graphData]);

  const isEdgeHighlighted = useCallback((edge: GraphEdge) => {
    if (selectedEdge === edge.id) return true;
    if (selectedNode && (edge.source === selectedNode || edge.target === selectedNode)) return true;
    if (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode)) return true;
    return false;
  }, [hoveredNode, selectedNode, selectedEdge]);

  const hasActiveSelection = selectedNode || hoveredNode;

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <section id="relationships" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">资产关系图谱</h2>
        <p className="text-gray-500">动态探索资产之间的语义关系 — 点击节点展开关联、筛选子图、查看详情。</p>
      </div>

      <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-brand-600" />
              <span className="text-sm font-semibold text-gray-800">关系图谱</span>
            </div>
            {graphData && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-brand-50 text-brand-600 rounded-full px-2 py-0.5 font-medium">
                  {graphData.meta.total_nodes} 节点
                </span>
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
                  {graphData.meta.total_edges} 关系
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 搜索 */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索节点..."
                value={filterKeyword}
                onChange={e => setFilterKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApplyFilter()}
                className="w-44 pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-1.5 rounded-lg transition-colors ${filterOpen ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title="筛选器"
            >
              <Filter size={15} />
            </button>
            <button onClick={handleReset} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors" title="重置">
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="放大">
                <ZoomIn size={14} />
              </button>
              <span className="text-[10px] text-gray-500 w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="缩小">
                <ZoomOut size={14} />
              </button>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* 主体区域 */}
        <div className={`flex ${isFullscreen ? 'h-[calc(100vh-52px)]' : 'h-[600px]'}`}>
          {/* 左侧筛选器 */}
          {filterOpen && (
            <div className="w-52 border-r border-gray-100 bg-gray-50/30 p-3 overflow-y-auto flex-shrink-0">
              <div className="space-y-4">
                {/* 资产类型 */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">资产类型</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setFilterTypeCode(''); }}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${!filterTypeCode ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      全部类型
                    </button>
                    {stats?.type_stats.map(ts => (
                      <button
                        key={ts.code}
                        onClick={() => setFilterTypeCode(ts.code === filterTypeCode ? '' : ts.code)}
                        className={`w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          filterTypeCode === ts.code ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ts.color }} />
                          <span className="truncate">{ts.name}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">{ts.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 状态 */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">状态</p>
                  <div className="space-y-1">
                    {['', 'published', 'reviewed', 'draft'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          filterStatus === s ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {s === '' ? '全部' : s === 'published' ? '已发布' : s === 'reviewed' ? '已审核' : '草稿'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 关系类型 */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">关系类型</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setFilterRelType('')}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${!filterRelType ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      全部关系
                    </button>
                    {relationTypes.map(rt => (
                      <button
                        key={rt.code}
                        onClick={() => setFilterRelType(rt.code === filterRelType ? '' : rt.code)}
                        className={`w-full flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          filterRelType === rt.code ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="w-3 h-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: rt.color }} />
                        <span className="truncate">{rt.name_zh}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-brand-600 text-white text-xs font-semibold rounded-lg py-2 hover:bg-brand-700 transition-colors"
                >
                  应用筛选
                </button>
              </div>
            </div>
          )}

          {/* 中间 Graph 画布 */}
          <div
            ref={svgContainerRef}
            className="flex-1 relative overflow-hidden bg-gray-50/20 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader size={24} className="text-brand-500 animate-spin mr-3" />
                <span className="text-gray-500 text-sm">正在加载图谱...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <AlertCircle size={20} className="mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            ) : graphData && graphData.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Layers size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">暂无图谱数据</p>
                <p className="text-xs mt-1">请先上传资产或调整筛选条件</p>
              </div>
            ) : graphData ? (
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                style={{ userSelect: 'none' }}
              >
                <defs>
                  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
                  </filter>
                  <filter id="nodeShadowHover" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.15" />
                  </filter>
                  <marker id="arrowGray" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="7" markerHeight="5" orient="auto">
                    <path d="M0,0 L10,3 L0,6 Z" fill="#d1d5db" />
                  </marker>
                  <marker id="arrowHighlight" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                    <path d="M0,0 L10,3 L0,6 Z" fill="#4f46e5" />
                  </marker>
                  {relationTypes.map(rt => (
                    <marker key={rt.code} id={`arrow-${rt.code}`} viewBox="0 0 10 6" refX="10" refY="3" markerWidth="7" markerHeight="5" orient="auto">
                      <path d="M0,0 L10,3 L0,6 Z" fill={rt.color} opacity="0.7" />
                    </marker>
                  ))}
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* 网格背景 */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width={svgSize.width} height={svgSize.height} fill="url(#grid)" />

                  {/* 边 */}
                  {graphData.edges.map(edge => {
                    const srcPos = positions.get(edge.source);
                    const tgtPos = positions.get(edge.target);
                    if (!srcPos || !tgtPos) return null;
                    const highlighted = isEdgeHighlighted(edge);
                    const dimmed = hasActiveSelection && !highlighted;
                    const dx = tgtPos.x - srcPos.x;
                    const dy = tgtPos.y - srcPos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const startX = srcPos.x + nx * 30;
                    const startY = srcPos.y + ny * 22;
                    const endX = tgtPos.x - nx * 30;
                    const endY = tgtPos.y - ny * 22;
                    const mx = (startX + endX) / 2;
                    const my = (startY + endY) / 2;
                    const offset = Math.min(20, dist * 0.08);
                    const cx = mx + ny * offset;
                    const cy = my - nx * offset;

                    return (
                      <g key={edge.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEdgeClick(edge.id); }}>
                        <path
                          d={`M${startX},${startY} Q${cx},${cy} ${endX},${endY}`}
                          fill="none"
                          stroke={highlighted ? '#4f46e5' : edge.color}
                          strokeWidth={highlighted ? 2.5 : 1.5}
                          strokeDasharray={edge.line_style === 'dashed' ? '6,3' : edge.line_style === 'dotted' ? '2,3' : 'none'}
                          markerEnd={highlighted ? 'url(#arrowHighlight)' : `url(#arrow-${edge.relation_type})`}
                          opacity={dimmed ? 0.12 : highlighted ? 1 : 0.6}
                          className="transition-all duration-200"
                        />
                        {/* 不合法 schema 标记 */}
                        {!edge.is_schema_valid && !dimmed && (
                          <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="white" strokeWidth={1.5} opacity={0.7} />
                        )}
                        {highlighted && (
                          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="600">
                            {edge.label}
                          </text>
                        )}
                        {/* 隐形粗线方便点击 */}
                        <path
                          d={`M${startX},${startY} Q${cx},${cy} ${endX},${endY}`}
                          fill="none" stroke="transparent" strokeWidth={12}
                        />
                      </g>
                    );
                  })}

                  {/* 节点 */}
                  {graphData.nodes.map(node => {
                    const pos = positions.get(node.id);
                    if (!pos) return null;
                    const highlighted = isNodeHighlighted(node.id);
                    const isSelected = selectedNode === node.id;
                    const dimmed = hasActiveSelection && !highlighted && !isSelected;
                    const isExpanded = expandedNodes.has(node.id);
                    const w = 120;
                    const h = 44;
                    const label = node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label;

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                        onDoubleClick={(e) => { e.stopPropagation(); handleNodeExpand(node.id); }}
                        opacity={dimmed ? 0.18 : 1}
                        style={{ transition: 'opacity 0.25s' }}
                      >
                        {/* 选中光环 */}
                        {isSelected && (
                          <rect
                            x={pos.x - w / 2 - 3}
                            y={pos.y - h / 2 - 3}
                            width={w + 6}
                            height={h + 6}
                            rx={14}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            strokeDasharray="4,2"
                            opacity={0.6}
                          />
                        )}
                        <rect
                          x={pos.x - w / 2}
                          y={pos.y - h / 2}
                          width={w}
                          height={h}
                          rx={10}
                          fill={highlighted || isSelected ? node.color + '12' : 'white'}
                          stroke={highlighted || isSelected ? node.color : '#e5e7eb'}
                          strokeWidth={highlighted || isSelected ? 2 : 1}
                          filter={highlighted ? 'url(#nodeShadowHover)' : 'url(#nodeShadow)'}
                        />
                        {/* 左侧类型色条 */}
                        <rect x={pos.x - w / 2} y={pos.y - h / 2} width={3.5} height={h} rx={1.5} fill={node.color} opacity={0.85} />
                        {/* 标题 */}
                        <text
                          x={pos.x + 2}
                          y={pos.y - 3}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill={highlighted || isSelected ? node.color : '#1f2937'}
                        >
                          {label}
                        </text>
                        {/* 类型标签 */}
                        <text
                          x={pos.x + 2}
                          y={pos.y + 12}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#9ca3af"
                        >
                          {node.typeName}
                        </text>
                        {/* 状态指示点 */}
                        <circle
                          cx={pos.x + w / 2 - 10}
                          cy={pos.y - h / 2 + 10}
                          r={3}
                          fill={node.status === 'published' ? '#10b981' : node.status === 'reviewed' ? '#f59e0b' : '#9ca3af'}
                        />
                        {/* 展开指示 */}
                        {isExpanded && (
                          <circle cx={pos.x - w / 2 + 10} cy={pos.y - h / 2 + 10} r={3} fill="#4f46e5" opacity={0.6} />
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            ) : null}

            {/* 图例 */}
            {graphData && graphData.nodes.length > 0 && (
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2.5 max-w-[280px]">
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">图例</p>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
                  {stats?.type_stats.filter(t => t.count > 0).slice(0, 9).map(ts => (
                    <div key={ts.code} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: ts.color }} />
                      <span className="text-[9px] text-gray-600 truncate">{ts.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center gap-3 text-[9px] text-gray-400">
                  <span className="flex items-center gap-1"><MousePointer size={9} /> 点击查看详情</span>
                  <span className="flex items-center gap-1">双击展开邻居</span>
                </div>
              </div>
            )}
          </div>

          {/* 右侧详情面板 */}
          {(selectedNode || selectedEdge) && (
            <div className="w-72 border-l border-gray-100 bg-white overflow-y-auto flex-shrink-0">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
                <span className="text-xs font-semibold text-gray-700">
                  {selectedNode ? '节点详情' : '关系详情'}
                </span>
                <button
                  onClick={() => { setSelectedNode(null); setSelectedEdge(null); setNodeDetail(null); setEdgeDetail(null); }}
                  className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={12} className="text-gray-500" />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader size={18} className="text-brand-500 animate-spin mr-2" />
                  <span className="text-xs text-gray-500">加载中...</span>
                </div>
              ) : selectedNode && nodeDetail ? (
                <NodeDetailPanel detail={nodeDetail} onNavigate={(id) => {
                  const nodeId = `obj-${id}`;
                  handleNodeClick(nodeId);
                }} />
              ) : selectedEdge && edgeDetail ? (
                <EdgeDetailPanel detail={edgeDetail} onNavigate={(id) => {
                  const nodeId = `obj-${id}`;
                  handleNodeClick(nodeId);
                }} />
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">加载失败</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 节点详情面板子组件
// ============================================================
const NodeDetailPanel: React.FC<{
  detail: OntologyObjectDetail;
  onNavigate: (objectId: number) => void;
}> = ({ detail, onNavigate }) => {
  const statusLabel = detail.status === 'published' ? '已发布' : detail.status === 'reviewed' ? '已审核' : '草稿';
  const statusColor = detail.status === 'published' ? '#10b981' : detail.status === 'reviewed' ? '#f59e0b' : '#9ca3af';

  return (
    <div className="p-4 space-y-4">
      {/* 头部 */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] uppercase font-bold rounded px-1.5 py-0.5" style={{ backgroundColor: detail.object_type_color + '18', color: detail.object_type_color }}>
            {detail.object_type_name}
          </span>
          <span className="text-[9px] font-medium rounded-full px-1.5 py-0.5" style={{ backgroundColor: statusColor + '18', color: statusColor }}>
            {statusLabel}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-900">{detail.name}</h3>
      </div>

      {/* 描述 */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">描述</p>
        <p className="text-xs text-gray-600 leading-relaxed">{detail.full_description || detail.short_description || '暂无'}</p>
      </div>

      {/* 标签 */}
      {detail.tags.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">标签</p>
          <div className="flex flex-wrap gap-1">
            {detail.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-brand-50 text-brand-600 rounded px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI 置信度 */}
      {detail.ai_confidence != null && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">AI 置信度</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${detail.ai_confidence}%` }} />
            </div>
            <span className="text-xs font-bold text-brand-600">{Math.round(detail.ai_confidence)}%</span>
          </div>
        </div>
      )}

      {/* 扩展属性 */}
      {detail.properties.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">扩展属性</p>
          <div className="space-y-1">
            {detail.properties.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                <span className="text-[10px] text-gray-500">{p.key}</span>
                <span className="text-[10px] font-medium text-gray-700">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 外部链接 */}
      {detail.external_link && (
        <a href={detail.external_link} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 hover:bg-blue-100 transition-colors">
          <ExternalLink size={12} className="text-blue-500" />
          <span className="text-[10px] text-blue-600 truncate">{detail.external_link}</span>
        </a>
      )}

      {/* KPI 公式 */}
      {detail.kpi_formula && (
        <div className="bg-emerald-50 rounded-lg p-2">
          <p className="text-[10px] font-semibold text-emerald-700 mb-0.5 flex items-center gap-1">
            <Calculator size={10} /> 计算公式
          </p>
          <p className="text-[10px] font-mono text-emerald-800">{detail.kpi_formula}</p>
        </div>
      )}

      {/* 正向关系 */}
      {detail.forward_relations.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <ArrowRight size={10} /> 正向关系 ({detail.forward_relations.length})
          </p>
          <div className="space-y-1">
            {detail.forward_relations.map(r => (
              <button key={r.relation_id} onClick={() => onNavigate(r.target_id)}
                className="w-full flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-brand-50 transition-colors text-left group">
                <span className="text-[9px] text-brand-500 bg-brand-50 rounded px-1 py-0.5 font-semibold flex-shrink-0">{r.label}</span>
                <span className="text-[10px] text-gray-700 group-hover:text-brand-700 truncate flex-1">{r.target_name}</span>
                {!r.is_schema_valid && <span title="Schema 未定义"><XCircle size={10} className="text-amber-400 flex-shrink-0" /></span>}
                <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 反向关系 */}
      {detail.reverse_relations.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Link2 size={10} /> 反向关系 ({detail.reverse_relations.length})
          </p>
          <div className="space-y-1">
            {detail.reverse_relations.map(r => (
              <button key={r.relation_id} onClick={() => onNavigate(r.source_id)}
                className="w-full flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-brand-50 transition-colors text-left group">
                <span className="text-[9px] text-violet-500 bg-violet-50 rounded px-1 py-0.5 font-semibold flex-shrink-0">{r.label}</span>
                <span className="text-[10px] text-gray-700 group-hover:text-brand-700 truncate flex-1">{r.source_name}</span>
                {!r.is_schema_valid && <span title="Schema 未定义"><XCircle size={10} className="text-amber-400 flex-shrink-0" /></span>}
                <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 元数据 */}
      <div className="pt-2 border-t border-gray-100">
        <div className="space-y-1 text-[10px] text-gray-400">
          {detail.created_by && <div className="flex items-center gap-1"><User size={9} /> {detail.created_by}</div>}
          {detail.created_at && <div className="flex items-center gap-1"><Clock size={9} /> 创建: {detail.created_at}</div>}
          <div className="flex items-center gap-1">ID: {detail.id}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 边详情面板子组件
// ============================================================
const EdgeDetailPanel: React.FC<{
  detail: RelationDetail;
  onNavigate: (objectId: number) => void;
}> = ({ detail, onNavigate }) => {
  return (
    <div className="p-4 space-y-4">
      {/* 关系类型头部 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-1 rounded-full" style={{ backgroundColor: detail.color }} />
          <span className="text-sm font-bold" style={{ color: detail.color }}>{detail.name_zh}</span>
        </div>
        <div className="text-[10px] text-gray-500">反向名称: {detail.reverse_name_zh}</div>
      </div>

      {/* Schema 状态 */}
      <div className={`flex items-center gap-2 rounded-lg p-2 ${detail.is_schema_valid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        {detail.is_schema_valid ? (
          <>
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">Schema 合法</span>
          </>
        ) : (
          <>
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">Schema 未定义</span>
          </>
        )}
      </div>

      {/* 起点 -> 终点 */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">关系链路</p>
        <div className="space-y-2">
          <button onClick={() => detail.from_object.id && onNavigate(detail.from_object.id)}
            className="w-full flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-brand-50 transition-colors text-left">
            <span className="text-[9px] text-gray-400 font-medium">起点</span>
            <span className="text-[10px] font-semibold text-gray-800 truncate flex-1">{detail.from_object.name}</span>
            <span className="text-[9px] text-gray-400">{detail.from_object.type_name}</span>
          </button>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-6 h-px bg-gray-300" />
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 rounded px-2 py-0.5">{detail.name_zh}</span>
            <ArrowRight size={10} className="text-gray-400" />
            <div className="w-6 h-px bg-gray-300" />
          </div>
          <button onClick={() => detail.to_object.id && onNavigate(detail.to_object.id)}
            className="w-full flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-brand-50 transition-colors text-left">
            <span className="text-[9px] text-gray-400 font-medium">终点</span>
            <span className="text-[10px] font-semibold text-gray-800 truncate flex-1">{detail.to_object.name}</span>
            <span className="text-[9px] text-gray-400">{detail.to_object.type_name}</span>
          </button>
        </div>
      </div>

      {/* 备注 */}
      {detail.remark && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">备注</p>
          <p className="text-xs text-gray-600">{detail.remark}</p>
        </div>
      )}

      {/* 权重 & 置信度 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-400">权重</p>
          <p className="text-sm font-bold text-gray-800">{detail.weight}</p>
        </div>
        {detail.ai_confidence != null && (
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">AI置信度</p>
            <p className="text-sm font-bold text-brand-600">{detail.ai_confidence}%</p>
          </div>
        )}
      </div>

      {/* 元数据 */}
      <div className="pt-2 border-t border-gray-100 space-y-1 text-[10px] text-gray-400">
        {detail.created_by && <div className="flex items-center gap-1"><User size={9} /> {detail.created_by}</div>}
        {detail.created_at && <div className="flex items-center gap-1"><Clock size={9} /> {detail.created_at}</div>}
        <div>ID: {detail.id}</div>
      </div>
    </div>
  );
};

export default GraphExplorer;
