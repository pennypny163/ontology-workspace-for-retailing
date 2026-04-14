import React from 'react';
import { Upload, Cpu, ClipboardCheck, Globe, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

const processSteps = [
  { icon: <Upload size={18} />, label: '上传', color: 'bg-blue-500' },
  { icon: <Cpu size={18} />, label: '提取', color: 'bg-violet-500' },
  { icon: <ClipboardCheck size={18} />, label: '审核', color: 'bg-amber-500' },
  { icon: <Globe size={18} />, label: '发布', color: 'bg-emerald-500' },
  { icon: <RotateCcw size={18} />, label: '复用', color: 'bg-brand-600' },
];

const HeroSection: React.FC = () => {
  return (
    <section id="overview" className="mb-12">
      {/* 主横幅 */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-brand-200" />
            <span className="text-brand-200 text-sm font-medium uppercase tracking-wider">企业级解决方案智能平台</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            零售解决方案本体工作空间
          </h1>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl">
            将分散的零售解决方案资料转化为可复用的结构化资产 —— 由 AI 自动提取、人工验证、本体驱动复用。
          </p>

          {/* 三大价值主张 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Upload size={20} />, title: '轻松上传', desc: '销售、售前、架构师可自然地上传资料 —— 无需技术背景。' },
              { icon: <Cpu size={20} />, title: 'AI 自动结构化', desc: 'AI 自动将资料分解为可复用的对象、关系和结构化模式。' },
              { icon: <RotateCcw size={20} />, title: '快速复用', desc: '即时查找和复用已有资产，下一个方案、演示或 POC 不再从零开始。' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-brand-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 说明面板 */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-brand-50/30 border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">工作流程</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-medium shadow-sm">PPT / 会议纪要</span>
              <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-medium shadow-sm">方案文档</span>
              <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-medium shadow-sm">演示说明</span>
              <ArrowRight size={16} className="text-brand-400 mx-1" />
              <span className="bg-brand-100 text-brand-700 rounded-lg px-3 py-1.5 font-semibold">AI 提取</span>
              <ArrowRight size={16} className="text-brand-400 mx-1" />
              <span className="bg-brand-100 text-brand-700 rounded-lg px-3 py-1.5 font-semibold">结构化资产图谱</span>
              <ArrowRight size={16} className="text-brand-400 mx-1" />
              <span className="bg-emerald-100 text-emerald-700 rounded-lg px-3 py-1.5 font-semibold">可复用推荐</span>
            </div>
          </div>
        </div>
      </div>

      {/* 流程条 */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {processSteps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white shadow-md`}>
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600">{step.label}</span>
              </div>
              {i < processSteps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className="h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full relative">
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-brand-300 to-brand-200 rounded-full" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
