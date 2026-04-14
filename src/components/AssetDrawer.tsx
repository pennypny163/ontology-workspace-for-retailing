import React, { useState, useEffect } from 'react';
import { X, Tag, Clock, User, Link2, Loader, AlertCircle, FileText, Paperclip, Download, ExternalLink, Calculator } from 'lucide-react';
import { fetchObjectDetail, ObjectDetail, ObjectListItem } from '../services/api';

interface AssetDrawerProps {
  /** 传入一个列表项（只需 id 即可触发加载详情） */
  asset: ObjectListItem | null;
  onClose: () => void;
}

// 类型code对应颜色
const typeColorMap: Record<string, string> = {
  industry: '#4f46e5',
  scenario: '#7c3aed',
  persona: '#2563eb',
  pain_point: '#dc2626',
  capability: '#059669',
  data_asset: '#0891b2',
  demo_asset: '#d97706',
  case_asset: '#be185d',
  playbook: '#4338ca',
  opportunity: '#ea580c',
  kpi: '#16a34a',
};

const statusLabelMap: Record<string, string> = {
  published: '已发布',
  reviewed: '已审核',
  draft: '草稿',
};

const AssetDrawer: React.FC<AssetDrawerProps> = ({ asset, onClose }) => {
  const [detail, setDetail] = useState<ObjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asset) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchObjectDetail(asset.id)
      .then(data => {
        setDetail(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || '加载资产详情失败');
        setLoading(false);
      });
  }, [asset]);

  if (!asset) return null;

  const color = detail ? (typeColorMap[detail.object_type_code] || '#4f46e5') : '#4f46e5';

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* 抽屉面板 */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
          <div>
            {detail && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] uppercase font-bold rounded px-2 py-0.5"
                    style={{ backgroundColor: color + '15', color }}
                  >
                    {detail.object_type_name}
                  </span>
                  <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${
                    detail.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                    detail.status === 'reviewed' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {statusLabelMap[detail.status] || detail.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{detail.name}</h2>
              </>
            )}
            {loading && <h2 className="text-lg font-bold text-gray-400">加载中...</h2>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-brand-500 animate-spin mr-3" />
            <span className="text-gray-500 text-sm">正在加载资产详情...</span>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="flex items-center justify-center py-20 text-red-500">
            <AlertCircle size={20} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* 详情内容 */}
        {detail && !loading && !error && (
          <div className="px-6 py-5 space-y-6">
            {/* 描述 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">描述</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {detail.full_description || detail.short_description || '暂无描述'}
              </p>
            </div>

            {/* 附件 */}
            {detail.attachment_filename && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip size={12} />
                  附件文件
                </h3>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{detail.attachment_filename}</p>
                    <p className="text-xs text-gray-500">
                      {detail.attachment_size
                        ? detail.attachment_size < 1024 * 1024
                          ? `${(detail.attachment_size / 1024).toFixed(1)} KB`
                          : `${(detail.attachment_size / (1024 * 1024)).toFixed(1)} MB`
                        : ''}
                    </p>
                  </div>
                  {detail.attachment_path && (
                    <a
                      href={`/api/attachments/${detail.attachment_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors flex-shrink-0"
                      title="下载附件"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 外部链接 */}
            {detail.external_link && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  能力介绍链接
                </h3>
                <a
                  href={detail.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <ExternalLink size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-700 truncate">{detail.external_link}</p>
                    <p className="text-xs text-blue-500">点击访问产品页面 →</p>
                  </div>
                </a>
              </div>
            )}

            {/* KPI 公式 */}
            {detail.kpi_formula && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calculator size={12} />
                  计算公式
                </h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-sm font-mono text-emerald-800 leading-relaxed">{detail.kpi_formula}</p>
                </div>
              </div>
            )}

            {/* 标签 */}
            {detail.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 rounded-lg px-2.5 py-1">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI 置信度 */}
            {detail.ai_confidence != null && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI 置信度</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                      style={{ width: `${detail.ai_confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-brand-600">{Math.round(detail.ai_confidence)}%</span>
                </div>
              </div>
            )}

            {/* 元数据 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">元数据</h3>
              <div className="space-y-2">
                {detail.created_by && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span>创建者：<span className="font-medium text-gray-800">{detail.created_by}</span></span>
                  </div>
                )}
                {detail.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>创建时间：{detail.created_at}</span>
                  </div>
                )}
                {detail.updated_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>更新时间：{detail.updated_at}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 关联资产 */}
            {detail.relations.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 size={12} />
                  关联资产（{detail.relations.length}）
                </h3>
                <div className="space-y-2">
                  {detail.relations.map((rel, i) => {
                    const relColor = typeColorMap[rel.related_object_type] || '#4f46e5';
                    return (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <span
                          className="text-[9px] uppercase font-bold rounded px-1.5 py-0.5 flex-shrink-0"
                          style={{ backgroundColor: relColor + '15', color: relColor }}
                        >
                          {rel.related_object_type_name}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{rel.related_object_name}</p>
                        </div>
                        <span className="text-[10px] text-brand-500 font-semibold bg-brand-50 rounded px-1.5 py-0.5 flex-shrink-0">
                          {rel.relation_label_cn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 无关联提示 */}
            {detail.relations.length === 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 size={12} />
                  关联资产
                </h3>
                <p className="text-xs text-gray-400 py-4 text-center">暂无关联资产</p>
              </div>
            )}
          </div>
        )}

        {/* 底部 */}
        {detail && !loading && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>资产 ID: {detail.id}</span>
              <span>类型: {detail.object_type_code}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssetDrawer;
