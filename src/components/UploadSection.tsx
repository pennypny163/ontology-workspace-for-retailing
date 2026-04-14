import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, ClipboardList, LayoutTemplate, MessageSquare,
  FileUp, Check, Sparkles, Loader, AlertCircle, X, CheckCircle,
  Tag, Link2, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  uploadAndExtract, confirmSaveAssets,
  ExtractedObject, ExtractedRelation, ExtractionResult,
  ProgressCallback
} from '../services/api';
import GuidedForm from './GuidedForm';
import NLChatPanel from './NLChatPanel';
import TemplatePanel from './TemplatePanel';

// 关系类型中文映射
const RELATION_CN: Record<string, string> = {
  serves_for: '服务于',
  solves: '解决',
  depends_on: '依赖',
  measured_by: '由…衡量',
  related_to: '相关',
  belongs_to: '属于',
  validated_by: '被…验证',
};

// 资产类型中文映射
const TYPE_CN: Record<string, string> = {
  industry: '行业',
  scenario: '场景',
  persona: '角色',
  pain_point: '痛点',
  capability: '能力模块',
  data_asset: '数据资产',
  demo_asset: '演示资产',
  case_asset: '案例资产',
  playbook: '剧本',
  opportunity: '商机',
  kpi: 'KPI',
};

// 类型颜色映射
const TYPE_COLOR: Record<string, string> = {
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

// 上传方式定义
const uploadMethods = [
  {
    icon: <FileUp size={24} />,
    title: '上传文件',
    desc: '拖放 PPT、DOC、PDF 等文件，AI 自动解析并提取资产对象。',
    color: '#4f46e5',
    details: ['支持 PPTX、DOCX、PDF、TXT', 'AI 自动解析并结构化提取', '提取结果可预览和编辑后入库'],
  },
  {
    icon: <ClipboardList size={24} />,
    title: '填写引导表单',
    desc: '简洁的结构化表单，认知负担低 — 下拉菜单、标签和智能模板引导每个字段。',
    color: '#059669',
    details: ['预填下拉选项', '自动推荐标签', '基于模板的字段分组'],
  },
  {
    icon: <LayoutTemplate size={24} />,
    title: '从模板开始',
    desc: '选择行业模板作为起点，自由编辑每个字段适配你的实际案例，同一模板可反复使用创建不同案例。',
    color: '#d97706',
    details: ['4 个零售模板：促销/巡检/运营/SOP', '每个对象的名称、描述、标签均可自由修改', '修改名称后关系自动同步，可新增/删除对象和关系', '同一模板可反复使用：如给瑞幸和零食连锁分别做巡检'],
  },
  {
    icon: <MessageSquare size={24} />,
    title: '自然语言输入',
    desc: '用自然语言描述方案，AI 通过 3 轮对话追问逐步完善，最终自动生成结构化记录。',
    color: '#7c3aed',
    details: ['AI 多轮追问补全信息', '3 轮对话后自动结构化', '保存前可审核和编辑'],
  },
];

const UploadSection: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传+提取状态
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>('');  // 实时进度消息

  // 编辑提取结果
  const [editedObjects, setEditedObjects] = useState<ExtractedObject[]>([]);
  const [editedRelations, setEditedRelations] = useState<ExtractedRelation[]>([]);

  // 保存状态
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 展开/折叠详情
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showTextPreview, setShowTextPreview] = useState(false);

  // 引导表单弹窗
  const [showGuidedForm, setShowGuidedForm] = useState(false);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    // 前端预检查文件大小（最大 50MB）
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`文件大小 ${(file.size / (1024 * 1024)).toFixed(1)}MB 超过 50MB 限制，请压缩后再上传`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setExtractionResult(null);
    setSaveSuccess(null);
    setSaveError(null);
    setProgressMsg('正在上传文件...');

    try {
      const result = await uploadAndExtract(file, (msg) => {
        setProgressMsg(msg);
      });
      setExtractionResult(result);
      setEditedObjects([...result.objects]);
      setEditedRelations([...result.relations]);
    } catch (err: any) {
      setUploadError(err.message || '上传提取失败');
    } finally {
      setUploading(false);
      setProgressMsg('');
    }
  }, []);

  // 文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // 重置 input，允许重复选择同一文件
    e.target.value = '';
  }, [handleFileUpload]);

  // 拖放处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // 删除某个提取对象
  const removeObject = useCallback((idx: number) => {
    const removedName = editedObjects[idx]?.name;
    setEditedObjects(prev => prev.filter((_, i) => i !== idx));
    // 同时移除相关关系
    setEditedRelations(prev => prev.filter(
      r => r.from_name !== removedName && r.to_name !== removedName
    ));
    if (expandedIdx === idx) setExpandedIdx(null);
  }, [editedObjects, expandedIdx]);

  // 删除某个关系
  const removeRelation = useCallback((idx: number) => {
    setEditedRelations(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // 确认保存到数据库
  const handleConfirmSave = useCallback(async () => {
    if (editedObjects.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const resp = await confirmSaveAssets({
        objects: editedObjects,
        relations: editedRelations,
        created_by: 'AI提取',
      });
      setSaveSuccess(resp.message);
      // 3秒后自动清除成功提示
      setTimeout(() => {
        setExtractionResult(null);
        setEditedObjects([]);
        setEditedRelations([]);
        setSaveSuccess(null);
      }, 4000);
    } catch (err: any) {
      setSaveError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }, [editedObjects, editedRelations]);

  // 重置上传
  const handleReset = useCallback(() => {
    setExtractionResult(null);
    setEditedObjects([]);
    setEditedRelations([]);
    setUploadError(null);
    setSaveSuccess(null);
    setSaveError(null);
    setExpandedIdx(null);
  }, []);

  return (
    <section id="upload" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">人人都能轻松贡献</h2>
        <p className="text-gray-500">四种直观的方式确保任何人 — 从销售到架构师 — 都能向资产库添加知识。</p>
      </div>

      {/* 醒目提示 */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Sparkles size={20} className="text-brand-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-800 mb-0.5">贡献者无需编辑复杂的模式定义。</p>
          <p className="text-sm text-brand-600">只需上传文件，AI 自动提取资产对象，确认后即可入库。无需数据库或本体知识背景。</p>
        </div>
      </div>

      {/* 方式卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {uploadMethods.map((method, i) => (
          <button
            key={i}
            onClick={() => setActiveMethod(i)}
            className={`text-left rounded-xl p-5 border-2 transition-all duration-200 ${
              activeMethod === i
                ? 'bg-white shadow-lg border-brand-300'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: method.color + '12', color: method.color }}
            >
              {method.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{method.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{method.desc}</p>
            <div className="space-y-1">
              {method.details.map((d, j) => (
                <div key={j} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Check size={12} className="flex-shrink-0" style={{ color: method.color }} />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* 交互演示区 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* ========== 方式 0：真实文件上传 ========== */}
        {activeMethod === 0 && (
          <div className="p-8">
            {/* 无提取结果时显示上传区 */}
            {!extractionResult && !uploading && (
              <>
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    dragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-300 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30'
                  }`}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={40} className={`mx-auto mb-4 ${dragActive ? 'text-brand-500' : 'text-gray-300'}`} />
                  <p className="text-sm font-semibold text-gray-700 mb-1">将文件拖放到此处或点击上传</p>
                  <p className="text-xs text-gray-400">支持 PPTX、DOCX、PDF、TXT — 最大 50MB</p>
                  <p className="text-xs text-brand-500 mt-2 font-medium">上传后 AI 将自动提取资产对象</p>
                  <div className="mt-4 flex justify-center gap-3">
                    {['PPTX', 'DOCX', 'PDF', 'TXT'].map(fmt => (
                      <span key={fmt} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 font-medium">
                        <FileText size={12} className="inline mr-1" />{fmt}
                      </span>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx,.docx,.pdf,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* 上传错误提示 */}
                {uploadError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">提取失败</p>
                      <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                    </div>
                    <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* 上传/提取中 */}
            {uploading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <Loader size={40} className="text-brand-500 animate-spin" />
                  <Sparkles size={16} className="text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">AI 正在解析文件并提取资产…</p>
                {/* 实时进度消息 */}
                {progressMsg && (
                  <p className="text-xs text-brand-600 font-medium bg-brand-50 rounded-lg px-3 py-1.5 mb-2">{progressMsg}</p>
                )}
                <p className="text-xs text-gray-400">使用流式连接，不会因超时断开</p>
                <div className="mt-4 flex items-center gap-2">
                  {['解析文件', '调用AI', '结构化', '返回结果'].map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-brand-500' : 'bg-gray-300'} animate-pulse`} 
                             style={{ animationDelay: `${i * 0.3}s` }} />
                        <span className="text-[10px] text-gray-500">{step}</span>
                      </div>
                      {i < 3 && <div className="w-4 h-px bg-gray-200" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* 提取结果展示 */}
            {extractionResult && !uploading && (
              <div>
                {/* 头部信息 */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={18} className="text-emerald-500" />
                      <h3 className="text-lg font-bold text-gray-900">提取完成</h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      来源文件：<span className="font-medium text-gray-700">{extractionResult.source_filename}</span>
                      {' · '}提取了 <span className="font-bold text-brand-600">{editedObjects.length}</span> 个资产对象
                      和 <span className="font-bold text-brand-600">{editedRelations.length}</span> 个关系
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 bg-gray-50 rounded-lg px-3 py-1.5"
                  >
                    <Upload size={12} />
                    重新上传
                  </button>
                </div>

                {/* AI 概述 */}
                {extractionResult.summary && (
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-brand-500" />
                      <span className="text-xs font-semibold text-brand-700">AI 摘要</span>
                    </div>
                    <p className="text-sm text-brand-800">{extractionResult.summary}</p>
                  </div>
                )}

                {/* 原文预览（可折叠） */}
                <button
                  onClick={() => setShowTextPreview(!showTextPreview)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4"
                >
                  {showTextPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showTextPreview ? '收起' : '查看'} 提取的文本内容
                </button>
                {showTextPreview && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">{extractionResult.text_preview}</pre>
                  </div>
                )}

                {/* 提取的资产对象列表 */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-brand-500" />
                    提取的资产对象（{editedObjects.length}）
                    <span className="text-[10px] text-gray-400 font-normal">— 点击展开详情，可删除不需要的对象</span>
                  </h4>
                  <div className="space-y-2">
                    {editedObjects.map((obj, idx) => {
                      const color = TYPE_COLOR[obj.object_type_code] || '#4f46e5';
                      const isExpanded = expandedIdx === idx;
                      return (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-200 transition-colors">
                          <div
                            className="flex items-center gap-3 p-3 cursor-pointer"
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          >
                            <span
                              className="text-[10px] uppercase font-bold rounded px-2 py-0.5 flex-shrink-0"
                              style={{ backgroundColor: color + '15', color }}
                            >
                              {TYPE_CN[obj.object_type_code] || obj.object_type_code}
                            </span>
                            <span className="text-sm font-medium text-gray-900 flex-1 truncate">{obj.name}</span>
                            {obj.ai_confidence != null && (
                              <span className="text-[10px] text-brand-600 font-bold bg-brand-50 rounded-full px-2 py-0.5">
                                {Math.round(obj.ai_confidence)}%
                              </span>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); removeObject(idx); }}
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                              title="删除此对象"
                            >
                              <Trash2 size={14} />
                            </button>
                            {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                          </div>
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-0 border-t border-gray-100 bg-gray-50/50">
                              {obj.short_description && (
                                <p className="text-xs text-gray-600 mt-2"><span className="font-semibold text-gray-500">简述：</span>{obj.short_description}</p>
                              )}
                              {obj.full_description && (
                                <p className="text-xs text-gray-600 mt-1"><span className="font-semibold text-gray-500">详述：</span>{obj.full_description}</p>
                              )}
                              {obj.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {obj.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-brand-50 text-brand-600 rounded px-1.5 py-0.5">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {editedObjects.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">所有对象已被移除</p>
                    )}
                  </div>
                </div>

                {/* 提取的关系列表 */}
                {editedRelations.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Link2 size={14} className="text-violet-500" />
                      提取的关系（{editedRelations.length}）
                    </h4>
                    <div className="space-y-1.5">
                      {editedRelations.map((rel, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                          <span className="text-xs font-medium text-gray-800 truncate">{rel.from_name}</span>
                          <span className="text-[10px] text-brand-500 font-semibold bg-brand-50 rounded px-1.5 py-0.5 flex-shrink-0">
                            {RELATION_CN[rel.relation_type] || rel.relation_type}
                          </span>
                          <span className="text-xs font-medium text-gray-800 truncate">{rel.to_name}</span>
                          <button
                            onClick={() => removeRelation(idx)}
                            className="ml-auto text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleConfirmSave}
                    disabled={saving || editedObjects.length === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${
                      saving || editedObjects.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg'
                    }`}
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {saving ? '正在保存...' : `确认入库（${editedObjects.length} 个对象）`}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>

                {/* 保存成功 */}
                {saveSuccess && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-emerald-500" />
                      <p className="text-sm font-semibold text-emerald-800">{saveSuccess}</p>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">所有资产已以「草稿」状态保存，可在资产库中查看和审核。</p>
                  </div>
                )}

                {/* 保存失败 */}
                {saveError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-red-500" />
                      <p className="text-sm font-semibold text-red-800">保存失败</p>
                    </div>
                    <p className="text-xs text-red-600 mt-1">{saveError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== 方式 1：引导表单 ========== */}
        {activeMethod === 1 && (
          <div className="p-8">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">引导式贡献表单</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                分步向导帮你轻松创建资产 — 选择类型、填写信息、建立关系、AI 智能增强，最终确认入库。
                <br />
                <span className="text-brand-600 font-medium">无需任何技术背景，人人都能贡献。</span>
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6 text-left max-w-sm mx-auto">
                {[
                  { icon: '🎯', text: '11种资产类型可视化选择' },
                  { icon: '✨', text: 'AI 自动补充描述和标签' },
                  { icon: '🔗', text: '关联已有资产建立关系图谱' },
                  { icon: '📋', text: '预览确认后一键入库' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="text-xs text-gray-700 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowGuidedForm(true)}
                className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md inline-flex items-center gap-2"
              >
                <ClipboardList size={16} />
                打开引导表单
              </button>
            </div>

            {/* 引导表单弹窗 */}
            {showGuidedForm && (
              <GuidedForm
                onClose={() => setShowGuidedForm(false)}
                onSuccess={() => setShowGuidedForm(false)}
              />
            )}
          </div>
        )}

        {/* ========== 方式 2：模板 ========== */}
        {activeMethod === 2 && (
          <TemplatePanel />
        )}

        {/* ========== 方式 3：自然语言对话 ========== */}
        {activeMethod === 3 && (
          <NLChatPanel />
        )}
      </div>
    </section>
  );
};

export default UploadSection;
