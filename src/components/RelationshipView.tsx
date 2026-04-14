import React, { useState, useRef, useCallback } from 'react';
import { ObjectListItem } from '../services/api';

interface RelNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
}

interface RelEdge {
  from: string;
  to: string;
  label: string;
}

const typeColors: Record<string, string> = {
  scenario: '#7c3aed',
  persona: '#2563eb',
  painPoint: '#dc2626',
  capability: '#059669',
  dataAsset: '#0891b2',
  demoAsset: '#d97706',
  caseAsset: '#be185d',
  kpi: '#16a34a',
  playbook: '#4338ca',
};

const typeBgColors: Record<string, string> = {
  scenario: '#f5f3ff',
  persona: '#eff6ff',
  painPoint: '#fef2f2',
  capability: '#ecfdf5',
  dataAsset: '#ecfeff',
  demoAsset: '#fffbeb',
  caseAsset: '#fdf2f8',
  kpi: '#f0fdf4',
  playbook: '#eef2ff',
};

const typeLabels: Record<string, string> = {
  scenario: '场景',
  persona: '角色',
  painPoint: '痛点',
  capability: '能力模块',
  dataAsset: '数据资产',
  demoAsset: '演示资产',
  caseAsset: '案例资产',
  kpi: 'KPI',
  playbook: '剧本',
};

const featuredNodes: RelNode[] = [
  { id: 'center', label: '门店巡检\nCopilot', type: 'scenario', x: 400, y: 280, color: typeColors.scenario },
  { id: 'n1', label: '区域经理', type: 'persona', x: 160, y: 120, color: typeColors.persona },
  { id: 'n2', label: '人工巡检汇总\n效率低下', type: 'painPoint', x: 640, y: 100, color: typeColors.painPoint },
  { id: 'n3', label: '巡检清单\nCopilot', type: 'capability', x: 120, y: 400, color: typeColors.capability },
  { id: 'n4', label: '问题汇总\n生成器', type: 'capability', x: 300, y: 480, color: typeColors.capability },
  { id: 'n5', label: '门店评分\n模型', type: 'capability', x: 520, y: 480, color: typeColors.capability },
  { id: 'n6', label: '巡检记录\n与照片', type: 'dataAsset', x: 680, y: 400, color: typeColors.dataAsset },
  { id: 'n7', label: '零售巡检\n助手演示', type: 'demoAsset', x: 680, y: 220, color: typeColors.demoAsset },
  { id: 'n8', label: '连锁便利店\n试点案例', type: 'caseAsset', x: 160, y: 240, color: typeColors.caseAsset },
  { id: 'n9', label: '问题关闭\n时长', type: 'kpi', x: 400, y: 100, color: typeColors.kpi },
  { id: 'n10', label: '巡检覆盖率', type: 'kpi', x: 240, y: 60, color: typeColors.kpi },
];

const featuredEdges: RelEdge[] = [
  { from: 'center', to: 'n1', label: '服务于' },
  { from: 'center', to: 'n2', label: '解决' },
  { from: 'center', to: 'n3', label: '依赖' },
  { from: 'center', to: 'n4', label: '依赖' },
  { from: 'center', to: 'n5', label: '依赖' },
  { from: 'n3', to: 'n6', label: '使用' },
  { from: 'n7', to: 'center', label: '演示' },
  { from: 'n8', to: 'center', label: '验证' },
  { from: 'n9', to: 'center', label: '衡量' },
  { from: 'n10', to: 'center', label: '衡量' },
];

const schemaRelations = [
  { from: '场景', to: '角色', label: '服务于', fromColor: typeColors.scenario, toColor: typeColors.persona },
  { from: '场景', to: '痛点', label: '解决', fromColor: typeColors.scenario, toColor: typeColors.painPoint },
  { from: '场景', to: '能力模块', label: '依赖', fromColor: typeColors.scenario, toColor: typeColors.capability },
  { from: '能力模块', to: '数据资产', label: '使用', fromColor: typeColors.capability, toColor: typeColors.dataAsset },
  { from: '演示资产', to: '场景', label: '演示', fromColor: typeColors.demoAsset, toColor: typeColors.scenario },
  { from: '案例资产', to: '场景', label: '验证', fromColor: typeColors.caseAsset, toColor: typeColors.scenario },
  { from: '剧本', to: '商机', label: '指导', fromColor: typeColors.playbook, toColor: '#ea580c' },
  { from: 'KPI', to: '场景', label: '衡量', fromColor: typeColors.kpi, toColor: typeColors.scenario },
];

interface RelationshipViewProps {
  onAssetClick: (asset: ObjectListItem) => void;
}

const RelationshipView: React.FC<RelationshipViewProps> = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tab, setTab] = useState<'graph' | 'schema'>('graph');
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeById = useCallback((id: string) => featuredNodes.find(n => n.id === id), []);

  const isEdgeHighlighted = useCallback((edge: RelEdge) => {
    if (!hoveredNode) return false;
    return edge.from === hoveredNode || edge.to === hoveredNode;
  }, [hoveredNode]);

  const isNodeHighlighted = useCallback((nodeId: string) => {
    if (!hoveredNode) return false;
    if (nodeId === hoveredNode) return true;
    return featuredEdges.some(e =>
      (e.from === hoveredNode && e.to === nodeId) ||
      (e.to === hoveredNode && e.from === nodeId)
    );
  }, [hoveredNode]);

  return (
    <section id="relationships" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">资产之间如何关联</h2>
        <p className="text-gray-500">本体模型定义了方案对象之间的类型化关系 — 实现结构化复用与智能推荐。</p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('graph')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'graph' ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          典型示例
        </button>
        <button
          onClick={() => setTab('schema')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'schema' ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          本体模式
        </button>
      </div>

      {tab === 'graph' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-dot" />
              <h3 className="font-semibold text-gray-900">门店巡检 Copilot — 关系图谱</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-5">悬停在节点上可高亮显示关联关系</p>
          </div>
          <div className="relative" style={{ height: 560 }}>
            <svg ref={svgRef} viewBox="0 0 800 560" className="w-full h-full">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
                </filter>
                <filter id="shadowHover" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" />
                </filter>
                {Object.entries(typeColors).map(([type, color]) => (
                  <marker
                    key={type}
                    id={`arrow-${type}`}
                    viewBox="0 0 10 6"
                    refX="10"
                    refY="3"
                    markerWidth="8"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,0 L10,3 L0,6 Z" fill={color} opacity="0.6" />
                  </marker>
                ))}
                <marker id="arrow-default" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,3 L0,6 Z" fill="#9ca3af" opacity="0.4" />
                </marker>
                <marker id="arrow-highlight" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,3 L0,6 Z" fill="#4f46e5" opacity="0.8" />
                </marker>
              </defs>

              {/* 边线 */}
              {featuredEdges.map((edge, i) => {
                const from = getNodeById(edge.from);
                const to = getNodeById(edge.to);
                if (!from || !to) return null;
                const highlighted = isEdgeHighlighted(edge);
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / dist;
                const ny = dy / dist;
                const startX = from.x + nx * 50;
                const startY = from.y + ny * 25;
                const endX = to.x - nx * 50;
                const endY = to.y - ny * 25;
                const mx = (startX + endX) / 2;
                const my = (startY + endY) / 2;
                const offset = 20;
                const cx = mx + ny * offset;
                const cy = my - nx * offset;

                return (
                  <g key={i}>
                    <path
                      d={`M${startX},${startY} Q${cx},${cy} ${endX},${endY}`}
                      fill="none"
                      stroke={highlighted ? '#4f46e5' : '#d1d5db'}
                      strokeWidth={highlighted ? 2.5 : 1.5}
                      strokeDasharray={highlighted ? 'none' : 'none'}
                      markerEnd={highlighted ? 'url(#arrow-highlight)' : 'url(#arrow-default)'}
                      className="transition-all duration-300"
                      opacity={hoveredNode && !highlighted ? 0.15 : 1}
                    />
                    {highlighted && (
                      <text x={cx} y={cy - 8} textAnchor="middle" className="text-[10px] fill-brand-600 font-semibold">
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 节点 */}
              {featuredNodes.map(node => {
                const highlighted = isNodeHighlighted(node.id);
                const isCenter = node.id === 'center';
                const w = isCenter ? 140 : 120;
                const h = isCenter ? 55 : 45;
                const lines = node.label.split('\n');
                const bgColor = typeBgColors[node.type] || '#f9fafb';

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                    opacity={hoveredNode && !highlighted ? 0.25 : 1}
                    style={{ transition: 'opacity 0.3s' }}
                  >
                    <rect
                      x={node.x - w / 2}
                      y={node.y - h / 2}
                      width={w}
                      height={h}
                      rx={12}
                      fill={highlighted || isCenter ? bgColor : 'white'}
                      stroke={highlighted ? node.color : '#e5e7eb'}
                      strokeWidth={highlighted ? 2.5 : 1.5}
                      filter={highlighted ? 'url(#shadowHover)' : 'url(#shadow)'}
                    />
                    {/* 类型指示条 */}
                    <rect
                      x={node.x - w / 2}
                      y={node.y - h / 2}
                      width={4}
                      height={h}
                      rx={2}
                      fill={node.color}
                      opacity={0.8}
                    />
                    {lines.map((line, li) => (
                      <text
                        key={li}
                        x={node.x + 2}
                        y={node.y + (li - (lines.length - 1) / 2) * 14 + 1}
                        textAnchor="middle"
                        className={`${isCenter ? 'text-[11px] font-bold' : 'text-[10px] font-medium'}`}
                        fill={highlighted ? node.color : '#374151'}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* 图例 */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">节点类型</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {Object.entries(typeColors).slice(0, 9).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-gray-600">{typeLabels[type] || type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'schema' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">本体关系模式</h3>
          <p className="text-sm text-gray-500 mb-6">核心关系类型将方案对象连接成可复用的知识图谱。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schemaRelations.map((rel, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 hover:bg-brand-50/50 transition-colors">
                <span
                  className="text-xs font-semibold rounded-lg px-2.5 py-1"
                  style={{ backgroundColor: rel.fromColor + '15', color: rel.fromColor }}
                >
                  {rel.from}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-6 h-px bg-gray-300" />
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.5">{rel.label}</span>
                  <div className="w-6 h-px bg-gray-300" />
                  <span className="text-gray-400">→</span>
                </div>
                <span
                  className="text-xs font-semibold rounded-lg px-2.5 py-1"
                  style={{ backgroundColor: rel.toColor + '15', color: rel.toColor }}
                >
                  {rel.to}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RelationshipView;