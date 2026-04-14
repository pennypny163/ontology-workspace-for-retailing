import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle, Circle, Loader, ThumbsUp, ThumbsDown,
  Edit3, Link2, AlertTriangle, Sparkles, FileBox, Clock
} from 'lucide-react';
import { aiExtractionExample } from '../data/mockData';

type ActionState = 'pending' | 'approved' | 'rejected' | 'edited';

const AIWorkbench: React.FC = () => {
  const [animStep, setAnimStep] = useState(0);
  const [objectActions, setObjectActions] = useState<Record<number, ActionState>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimStep(step);
      if (step >= aiExtractionExample.extractionSteps.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 600);
  };

  useEffect(() => {
    const timer = setTimeout(startAnimation, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (idx: number, action: ActionState) => {
    setObjectActions(prev => ({ ...prev, [idx]: action }));
  };

  const getStepIcon = (i: number) => {
    if (i < animStep) return <CheckCircle size={16} className="text-emerald-500" />;
    if (i === animStep && isAnimating) return <Loader size={16} className="text-brand-500 animate-spin" />;
    return <Circle size={16} className="text-gray-300" />;
  };

  const typeNameMap: Record<string, string> = {
    scenario: '场景',
    persona: '角色',
    painPoint: '痛点',
    capability: '能力模块',
  };

  return (
    <section id="workbench" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 智能结构化工作台</h2>
        <p className="text-gray-500">核心智能引擎 — AI 自动从原始材料中提取结构化对象和关系。</p>
      </div>

      {/* 提示信息 */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Sparkles size={20} className="text-violet-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-800">AI 完成繁重的结构化工作。</p>
          <p className="text-sm text-violet-600">人工主要负责审核结构是否正确 — 批准、编辑或驳回建议。</p>
        </div>
      </div>

      {/* 三栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧面板 — 上传材料 */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">上传材料</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileBox size={16} className="text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{aiExtractionExample.inputFile}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{aiExtractionExample.fileType} · {aiExtractionExample.fileSize}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    <span className="text-[10px] text-emerald-600 font-medium">处理中</span>
                  </div>
                </div>
              </div>
            </div>
            {/* 队列中的其他文件 */}
            {[
              { name: '门店运营研讨会议纪要.docx', type: 'Word', size: '1.1 MB', status: 'queued' },
              { name: 'Q4零售演示方案.pdf', type: 'PDF', size: '2.8 MB', status: 'queued' },
            ].map((file, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 opacity-60">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{file.type} · {file.size}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400">排队中</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-400">上传者：{aiExtractionExample.uploadedBy}</p>
              <p className="text-[10px] text-gray-400">{aiExtractionExample.uploadedAt}</p>
            </div>
          </div>
        </div>

        {/* 中间面板 — AI 提取步骤 */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI 提取流程</h3>
            <button
              onClick={startAnimation}
              className="text-[10px] text-brand-600 font-semibold hover:text-brand-700"
            >
              ↻ 重新播放
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-0">
              {aiExtractionExample.extractionSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5">
                  <div className="flex flex-col items-center">
                    {getStepIcon(i)}
                    {i < aiExtractionExample.extractionSteps.length - 1 && (
                      <div className={`w-px h-6 mt-1 ${i < animStep ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className={`transition-opacity duration-300 ${i <= animStep ? 'opacity-100' : 'opacity-30'}`}>
                    <p className="text-xs font-semibold text-gray-800">{step.step}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 关联已有资产 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-3">
                <Link2 size={14} className="text-brand-500" />
                <p className="text-xs font-semibold text-gray-700">发现可复用资产</p>
              </div>
              {aiExtractionExample.relatedExistingAssets.map((asset, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span className="text-[11px] text-gray-700 truncate">{asset.name}</span>
                  </div>
                  <span className="text-[10px] text-brand-600 font-semibold flex-shrink-0">{Math.round(asset.similarity * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧面板 — 审核与批准 */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">审核与批准</h3>
          </div>
          <div className="p-4">
            {/* 建议对象 */}
            <p className="text-xs font-semibold text-gray-700 mb-3">建议对象</p>
            <div className="space-y-2 mb-5">
              {aiExtractionExample.suggestedObjects.map((obj, i) => {
                const action = objectActions[i] || obj.action;
                return (
                  <div key={i} className={`border rounded-xl p-3 transition-all ${
                    action === 'approved' ? 'border-emerald-200 bg-emerald-50/50' :
                    action === 'rejected' ? 'border-red-200 bg-red-50/50 opacity-50' :
                    'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] uppercase font-bold rounded px-1.5 py-0.5 ${
                          obj.type === 'scenario' ? 'bg-violet-100 text-violet-600' :
                          obj.type === 'persona' ? 'bg-blue-100 text-blue-600' :
                          obj.type === 'painPoint' ? 'bg-red-100 text-red-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>{typeNameMap[obj.type] || obj.type}</span>
                        <span className="text-xs font-medium text-gray-800 truncate">{obj.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 font-medium">{Math.round(obj.confidence * 100)}%</span>
                        {action !== 'approved' && action !== 'rejected' && (
                          <>
                            <button
                              onClick={() => handleAction(i, 'approved')}
                              className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                              title="批准"
                            >
                              <ThumbsUp size={12} />
                            </button>
                            <button
                              onClick={() => handleAction(i, 'edited')}
                              className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-colors"
                              title="编辑"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleAction(i, 'rejected')}
                              className="w-6 h-6 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                              title="驳回"
                            >
                              <ThumbsDown size={12} />
                            </button>
                          </>
                        )}
                        {action === 'approved' && <CheckCircle size={14} className="text-emerald-500" />}
                        {action === 'rejected' && <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 建议关系 */}
            <p className="text-xs font-semibold text-gray-700 mb-3">建议关系</p>
            <div className="space-y-1.5">
              {aiExtractionExample.suggestedRelationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-700 font-medium truncate">{rel.from}</span>
                  <span className="text-brand-500 font-bold text-[10px] bg-brand-50 rounded px-1.5 py-0.5 flex-shrink-0">{rel.label}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-gray-700 font-medium truncate">{rel.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIWorkbench;
