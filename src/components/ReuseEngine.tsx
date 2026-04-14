import React, { useState } from 'react';
import {
  Target, CheckCircle, Package, AlertCircle, FileText,
  Sparkles, ChevronRight, BarChart3, Lightbulb
} from 'lucide-react';
import { reuseRecommendation } from '../data/mockData';

const ReuseEngine: React.FC = () => {
  const [showProposal, setShowProposal] = useState(false);

  return (
    <section id="reuse" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">下一个零售演示如何更快完成</h2>
        <p className="text-gray-500">当新商机到来时，系统自动推荐可复用的场景、资产和提案结构。</p>
      </div>

      {/* 商机卡片 */}
      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-200 uppercase tracking-wider mb-1">新商机</p>
            <h3 className="text-lg font-bold">{reuseRecommendation.opportunityTitle}</h3>
            <p className="text-sm text-brand-100 mt-1">{reuseRecommendation.client} — {reuseRecommendation.requestSummary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-200" />
          <span className="text-sm text-brand-100">AI 正在分析需求并匹配可复用资产...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 推荐场景 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-800">推荐场景</h3>
          </div>
          <div className="space-y-3">
            {reuseRecommendation.recommendedScenarios.map((sc, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-900">{sc.name}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 rounded-full bg-gray-200 w-20">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${sc.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-brand-600 font-bold">{Math.round(sc.matchScore * 100)}% 匹配</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 font-medium">{sc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 可复用资产 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-800">可复用资产</h3>
          </div>
          <div className="space-y-2">
            {reuseRecommendation.reusableAssets.map((asset, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  asset.readiness === 'ready' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{asset.name}</p>
                  <p className="text-[10px] text-gray-500">{asset.type}</p>
                </div>
                {asset.readiness === 'ready' ? (
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* 缺失数据清单 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">缺失数据清单</p>
            <div className="space-y-1.5">
              {reuseRecommendation.missingDataChecklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 提案大纲 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-800">建议提案大纲</h3>
          </div>
          <div className="space-y-1.5 mb-5">
            {reuseRecommendation.proposalOutline.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <button
              onClick={() => setShowProposal(!showProposal)}
              className="w-full bg-brand-600 text-white text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-brand-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              生成提案草稿
            </button>
            <button className="w-full bg-white border border-brand-200 text-brand-600 text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
              <BarChart3 size={14} />
              生成下一步演示范围
            </button>
          </div>

          {showProposal && (
            <div className="mt-4 bg-brand-50 border border-brand-200 rounded-xl p-3 animate-fade-in-up">
              <p className="text-xs font-semibold text-brand-800 mb-1">✓ 草稿已生成</p>
              <p className="text-[10px] text-brand-600">基于推荐场景、可复用资产和参考案例，已自动生成 12 页提案草稿，可供架构师审阅。</p>
            </div>
          )}
        </div>
      </div>

      {/* 推荐场景组合 */}
      <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">推荐场景组合</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reuseRecommendation.recommendedScenarios.map((sc, i) => (
            <div key={i} className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-xl p-4 border border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <span className="text-sm font-bold text-gray-900">{sc.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 rounded-full bg-brand-200 flex-1">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${sc.matchScore * 100}%` }} />
                </div>
                <span className="text-[10px] text-brand-600 font-bold">{Math.round(sc.matchScore * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReuseEngine;
