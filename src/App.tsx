import React, { useState, useRef, useCallback } from 'react';
import Sidebar, { SectionId } from './components/Sidebar';
import HeroSection from './components/HeroSection';
import AssetLibrary from './components/AssetLibrary';
import GraphExplorer from './components/GraphExplorer';
import UploadSection from './components/UploadSection';
import AIWorkbench from './components/AIWorkbench';
import ReviewFlow from './components/ReviewFlow';
import ReuseEngine from './components/ReuseEngine';
import MetricsDashboard from './components/MetricsDashboard';
import AssetDrawer from './components/AssetDrawer';
import { ObjectListItem } from './services/api';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ObjectListItem | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((section: SectionId) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAssetClick = useCallback((asset: ObjectListItem) => {
    setSelectedAsset(asset);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        ref={mainRef}
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-semibold text-gray-800">零售解决方案本体工作台</h1>
              <span className="text-[10px] font-bold bg-brand-100 text-brand-600 rounded-full px-2 py-0.5">MVP</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>数据库已连接</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                SC
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <HeroSection />
          <AssetLibrary onAssetClick={handleAssetClick} />
          <GraphExplorer />
          <UploadSection />
          <AIWorkbench />
          <ReviewFlow />
          <ReuseEngine />
          <MetricsDashboard />

          {/* 页脚 */}
          <footer className="text-center py-8 border-t border-gray-200 mt-8">
            <p className="text-xs text-gray-400 mb-2">零售解决方案本体工作台 — 企业级 MVP</p>
          </footer>
        </div>
      </main>

      {/* Asset Detail Drawer */}
      <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  );
};

export default App;
