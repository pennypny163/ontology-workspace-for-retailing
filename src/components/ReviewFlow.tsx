import React from 'react';
import {
  FileEdit, Eye, Globe, Users, Shield, CheckCircle2,
  Copy, BookCheck, ListChecks, GitBranch, History, ArrowRight
} from 'lucide-react';

const statusSteps = [
  { label: '草稿', desc: '由贡献者提交', icon: <FileEdit size={20} />, color: '#6b7280', bg: '#f3f4f6' },
  { label: '已审核', desc: '由架构师验证', icon: <Eye size={20} />, color: '#d97706', bg: '#fffbeb' },
  { label: '已发布', desc: '全团队可复用', icon: <Globe size={20} />, color: '#059669', bg: '#ecfdf5' },
];

const roles = [
  { role: '销售 / 售前', action: '提交素材和初始结构', icon: <Users size={18} />, color: '#2563eb' },
  { role: '解决方案架构师', action: '审核结构，验证关联关系', icon: <Shield size={18} />, color: '#7c3aed' },
  { role: '产品 / 知识负责人', action: '将可复用资产发布到资产库', icon: <CheckCircle2 size={18} />, color: '#059669' },
];

const qualityControls = [
  { name: '重复检测', desc: 'AI 在发布前标记相似的已有资产', icon: <Copy size={16} /> },
  { name: '标准化词汇', desc: '确保命名和术语的一致性', icon: <BookCheck size={16} /> },
  { name: '必填字段', desc: '验证所有必填字段是否完整', icon: <ListChecks size={16} /> },
  { name: '关联验证', desc: '检查关系类型和目标的一致性', icon: <GitBranch size={16} /> },
  { name: '置信度评分', desc: 'AI 自动结构化内容的置信度', icon: <Shield size={16} /> },
  { name: '版本历史', desc: '完整的变更和审批审计记录', icon: <History size={16} /> },
];

const ReviewFlow: React.FC = () => {
  return (
    <section id="review" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">发布前审核</h2>
        <p className="text-gray-500">轻松贡献与质量管控并行 —— 结构化治理确保只有经过验证的资产才能进入可复用资产库。</p>
      </div>

      {/* 状态流程 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-5">发布工作流</h3>
        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-2xl mx-auto">
          {statusSteps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm"
                  style={{ backgroundColor: step.bg, color: step.color }}
                >
                  {step.icon}
                </div>
                <p className="text-sm font-bold" style={{ color: step.color }}>{step.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
              </div>
              {i < statusSteps.length - 1 && (
                <div className="flex items-center pb-6">
                  <div className="w-8 md:w-16 h-px bg-gray-300" />
                  <ArrowRight size={14} className="text-gray-400 mx-1" />
                  <div className="w-8 md:w-16 h-px bg-gray-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 角色 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">角色与职责</h3>
          <div className="space-y-3">
            {roles.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: r.color + '12', color: r.color }}
                >
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 质量管控 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">质量管控</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {qualityControls.map((ctrl, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                  {ctrl.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{ctrl.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{ctrl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewFlow;
