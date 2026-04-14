import React from 'react';
import {
  Recycle, Clock, MinusCircle, Zap, Package, ShoppingBag, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { dashboardMetrics } from '../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  Recycle: <Recycle size={22} />,
  Clock: <Clock size={22} />,
  MinusCircle: <MinusCircle size={22} />,
  Zap: <Zap size={22} />,
  Package: <Package size={22} />,
  ShoppingBag: <ShoppingBag size={22} />,
};

const MetricsDashboard: React.FC = () => {
  return (
    <section id="metrics" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">为什么管理层应该关注</h2>
        <p className="text-gray-500">结构化方案复用带来的可量化业务价值 — 更快的提案准备、更少的重复工作、更高的交付质量。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {dashboardMetrics.map((metric, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                {iconMap[metric.icon]}
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 rounded-full px-2 py-0.5">
                <ArrowUpRight size={12} />
                <span className="text-[10px] font-bold">{metric.delta}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-xs text-gray-500 font-medium">{metric.label}</p>
            {/* 迷你进度条 */}
            <div className="mt-3 h-1 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-1000"
                style={{ width: `${40 + i * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 总结卡片 */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-start gap-3 mb-6">
          <TrendingUp size={24} className="text-brand-300 mt-1" />
          <div>
            <h3 className="text-lg font-bold">结构化复用的复合增长效应</h3>
            <p className="text-sm text-gray-400 mt-1">今天发布的每一个资产都在加速明天的商机转化。价值随着资产库覆盖度的提升呈指数级增长。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: '当前', desc: '6 个零售场景已结构化并建立交叉关联', stat: '18 个可复用资产' },
            { label: '6 个月后', desc: '零售垂直领域全面覆盖，20+ 场景', stat: '预计 60+ 可复用资产' },
            { label: '1 年后', desc: '多垂直领域方案智能平台', stat: '预计 200+ 可复用资产' },
          ].map((phase, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs font-bold text-brand-300 uppercase">{phase.label}</span>
              <p className="text-sm font-semibold text-white mt-2 mb-1">{phase.stat}</p>
              <p className="text-xs text-gray-400">{phase.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsDashboard;
