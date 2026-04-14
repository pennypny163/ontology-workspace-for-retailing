import React from 'react';
import {
  LayoutDashboard, Box, GitBranch, Upload, Brain, CheckCircle,
  RotateCcw, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';

export type SectionId = 'overview' | 'assets' | 'relationships' | 'upload' | 'workbench' | 'review' | 'reuse' | 'metrics';

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '总览', icon: <LayoutDashboard size={20} /> },
  { id: 'assets', label: '资产类型', icon: <Box size={20} /> },
  { id: 'relationships', label: '关系图谱', icon: <GitBranch size={20} /> },
  { id: 'upload', label: '上传', icon: <Upload size={20} /> },
  { id: 'workbench', label: 'AI 工作台', icon: <Brain size={20} /> },
  { id: 'review', label: '审核流程', icon: <CheckCircle size={20} /> },
  { id: 'reuse', label: '复用引擎', icon: <RotateCcw size={20} /> },
  { id: 'metrics', label: '数据看板', icon: <BarChart3 size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, collapsed, onToggle }) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        {!collapsed && (
          <span className="ml-3 font-semibold text-gray-900 text-sm whitespace-nowrap">
            零售方案本体
          </span>
        )}
      </div>

      {/* 导航项 */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
              activeSection === item.id
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className={`flex-shrink-0 ${activeSection === item.id ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {item.icon}
            </span>
            {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* 折叠切换 */}
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-lg px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
