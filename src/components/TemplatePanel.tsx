import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  LayoutTemplate, ChevronDown, ChevronUp, ChevronRight, Tag, Link2,
  Trash2, CheckCircle, Loader, AlertCircle, Sparkles, Users, Clock,
  Building2, ArrowRight, Package, Eye, Calculator, ExternalLink,
  Plus, Pencil, RotateCcw, Save, X, Copy
} from 'lucide-react';
import { confirmSaveAssets, ExtractedObject, ExtractedRelation } from '../services/api';
import { RETAIL_TEMPLATES, RetailTemplate } from '../data/templateData';

// 资产类型中文映射
const TYPE_CN: Record<string, string> = {
  industry: '行业', scenario: '场景', persona: '角色',
  pain_point: '痛点', capability: '能力模块', data_asset: '数据资产',
  demo_asset: '演示资产', case_asset: '案例资产', playbook: '操作手册',
  opportunity: '商机', kpi: 'KPI',
};

const TYPE_COLOR: Record<string, string> = {
  industry: '#4f46e5', scenario: '#7c3aed', persona: '#2563eb',
  pain_point: '#dc2626', capability: '#059669', data_asset: '#0891b2',
  demo_asset: '#d97706', case_asset: '#be185d', playbook: '#4338ca',
  opportunity: '#ea580c', kpi: '#16a34a',
};

const RELATION_TYPES = [
  { value: 'serves_for', label: '服务于' },
  { value: 'solves', label: '解决' },
  { value: 'depends_on', label: '依赖' },
  { value: 'measured_by', label: '由…衡量' },
  { value: 'related_to', label: '相关' },
  { value: 'belongs_to', label: '属于' },
  { value: 'validated_by', label: '被…验证' },
];

const RELATION_CN: Record<string, string> = Object.fromEntries(
  RELATION_TYPES.map(r => [r.value, r.label])
);

const TYPE_OPTIONS = Object.entries(TYPE_CN).map(([code, name]) => ({ code, name }));

type TemplateView = 'grid' | 'editor' | 'confirm';

const TemplatePanel: React.FC = () => {
  const [view, setView] = useState<TemplateView>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<RetailTemplate | null>(null);

  // 编辑后的对象和关系
  const [editedObjects, setEditedObjects] = useState<ExtractedObject[]>([]);
  const [editedRelations, setEditedRelations] = useState<ExtractedRelation[]>([]);
  // 当前正在编辑的对象索引（-1=无，-2=新建中）
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  // 展开详情查看的对象索引
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // 案例名称（用于标识入库来源）
  const [caseName, setCaseName] = useState('');

  // 新增关系的临时状态
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [newRelFrom, setNewRelFrom] = useState('');
  const [newRelTo, setNewRelTo] = useState('');
  const [newRelType, setNewRelType] = useState('related_to');

  // 保存状态
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState({ objects: 0, relations: 0 });

  // 滚动引用
  const editorTopRef = useRef<HTMLDivElement>(null);

  // 选择模板进入编辑
  const handleSelectTemplate = useCallback((tmpl: RetailTemplate) => {
    setSelectedTemplate(tmpl);
    setEditedObjects(tmpl.objects.map(o => ({
      object_type_code: o.object_type_code,
      name: o.name,
      short_description: o.short_description,
      full_description: o.full_description,
      tags: [...o.tags],
      ai_confidence: o.ai_confidence,
      external_link: o.external_link || null,
      kpi_formula: o.kpi_formula || null,
    })));
    setEditedRelations(tmpl.relations.map(r => ({
      from_name: r.from_name,
      to_name: r.to_name,
      relation_type: r.relation_type,
      remark: r.remark,
    })));
    setEditingIdx(null);
    setExpandedIdx(null);
    setSaveSuccess(null);
    setSaveError(null);
    setCaseName('');
    setShowAddRelation(false);
    setView('editor');
  }, []);

  // 更新某个对象的某个字段
  const updateObjectField = useCallback((idx: number, field: keyof ExtractedObject, value: any) => {
    setEditedObjects(prev => {
      const next = [...prev];
      const old = next[idx];
      // 如果改了 name，同步更新关系中的引用
      if (field === 'name' && old.name !== value) {
        const oldName = old.name;
        setEditedRelations(rels => rels.map(r => ({
          ...r,
          from_name: r.from_name === oldName ? value as string : r.from_name,
          to_name: r.to_name === oldName ? value as string : r.to_name,
        })));
      }
      next[idx] = { ...old, [field]: value };
      return next;
    });
  }, []);

  // 更新标签（逗号分隔文本转数组）
  const updateObjectTags = useCallback((idx: number, tagStr: string) => {
    const tags = tagStr.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    updateObjectField(idx, 'tags', tags);
  }, [updateObjectField]);

  // 删除对象
  const removeObject = useCallback((idx: number) => {
    const removedName = editedObjects[idx]?.name;
    setEditedObjects(prev => prev.filter((_, i) => i !== idx));
    setEditedRelations(prev => prev.filter(
      r => r.from_name !== removedName && r.to_name !== removedName
    ));
    if (editingIdx === idx) setEditingIdx(null);
    if (expandedIdx === idx) setExpandedIdx(null);
  }, [editedObjects, editingIdx, expandedIdx]);

  // 新增空白对象
  const addNewObject = useCallback(() => {
    const newObj: ExtractedObject = {
      object_type_code: 'scenario',
      name: '',
      short_description: '',
      full_description: '',
      tags: [],
      ai_confidence: 80,
      external_link: null,
      kpi_formula: null,
    };
    setEditedObjects(prev => [...prev, newObj]);
    const newIdx = editedObjects.length;
    setEditingIdx(newIdx);
    setExpandedIdx(newIdx);
  }, [editedObjects.length]);

  // 删除关系
  const removeRelation = useCallback((idx: number) => {
    setEditedRelations(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // 新增关系
  const addRelation = useCallback(() => {
    if (!newRelFrom || !newRelTo) return;
    setEditedRelations(prev => [...prev, {
      from_name: newRelFrom,
      to_name: newRelTo,
      relation_type: newRelType,
      remark: null,
    }]);
    setNewRelFrom('');
    setNewRelTo('');
    setNewRelType('related_to');
    setShowAddRelation(false);
  }, [newRelFrom, newRelTo, newRelType]);

  // 重置为模板原始数据
  const resetToTemplate = useCallback(() => {
    if (!selectedTemplate) return;
    handleSelectTemplate(selectedTemplate);
  }, [selectedTemplate, handleSelectTemplate]);

  // 确认入库
  const handleConfirmSave = useCallback(async () => {
    // 过滤掉没有名称的空对象
    const validObjects = editedObjects.filter(o => o.name.trim());
    if (validObjects.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const source = caseName.trim()
        ? `模板「${selectedTemplate?.name}」→ ${caseName.trim()}`
        : `模板：${selectedTemplate?.name || '未知'}`;
      const resp = await confirmSaveAssets({
        objects: validObjects,
        relations: editedRelations,
        created_by: source,
      });
      setSaveSuccess(resp.message);
      setSavedCount({ objects: validObjects.length, relations: editedRelations.length });
      setView('confirm');
    } catch (err: any) {
      setSaveError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }, [editedObjects, editedRelations, selectedTemplate, caseName]);

  // 返回列表
  const handleBackToGrid = useCallback(() => {
    setView('grid');
    setSelectedTemplate(null);
    setEditedObjects([]);
    setEditedRelations([]);
    setSaveSuccess(null);
    setSaveError(null);
    setEditingIdx(null);
    setExpandedIdx(null);
    setCaseName('');
  }, []);

  // 继续使用此模板创建新案例
  const handleReuse = useCallback(() => {
    if (selectedTemplate) {
      handleSelectTemplate(selectedTemplate);
    }
  }, [selectedTemplate, handleSelectTemplate]);

  // 统计模板中各类型的对象数量
  const getTypeStats = (tmpl: RetailTemplate) => {
    const stats: Record<string, number> = {};
    tmpl.objects.forEach(o => {
      stats[o.object_type_code] = (stats[o.object_type_code] || 0) + 1;
    });
    return stats;
  };

  return (
    <div className="p-6">
      {/* ========== 模板列表（网格） ========== */}
      {view === 'grid' && (
        <div>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">从模板快速开始</h3>
            <p className="text-sm text-gray-500 mb-1">
              精心设计的零售行业资产模板，包含完整的
              <span className="font-semibold text-amber-600"> 场景→角色→痛点→能力→KPI </span>链路。
            </p>
            <p className="text-xs text-gray-400">
              选择模板 → <span className="text-amber-600 font-semibold">自由编辑每个字段适配你的案例</span> → 入库 → 还可基于同一模板创建下一个案例
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {RETAIL_TEMPLATES.map(tmpl => {
              const stats = getTypeStats(tmpl);
              return (
                <div
                  key={tmpl.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 group cursor-pointer"
                  onClick={() => handleSelectTemplate(tmpl)}
                >
                  {/* 模板头部渐变条 */}
                  <div className={`bg-gradient-to-r ${tmpl.bgGradient} px-5 py-4 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tmpl.emoji}</span>
                        <div>
                          <h4 className="font-bold text-base">{tmpl.name}</h4>
                          <p className="text-sm text-white/80 mt-0.5">{tmpl.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                  </div>

                  {/* 模板内容 */}
                  <div className="px-5 py-4">
                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{tmpl.description}</p>
                    {/* 类型统计标签 */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {Object.entries(stats).map(([type, count]) => {
                        const color = TYPE_COLOR[type] || '#4f46e5';
                        return (
                          <span key={type} className="text-[10px] font-medium rounded-lg px-2 py-0.5"
                            style={{ backgroundColor: color + '12', color }}>
                            {count} 个{TYPE_CN[type] || type}
                          </span>
                        );
                      })}
                      <span className="text-[10px] font-medium rounded-lg px-2 py-0.5 bg-violet-50 text-violet-600">
                        {tmpl.relations.length} 个关系
                      </span>
                    </div>
                    {/* 元信息 */}
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {tmpl.targetUsers.slice(0, 2).join('、')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {tmpl.applicableIndustry}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock size={10} />
                        {tmpl.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {/* 底部操作 */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Package size={12} style={{ color: tmpl.color }} />
                        {tmpl.objects.length} 个资产对象
                      </span>
                      <span className="text-xs text-amber-600 font-semibold group-hover:underline flex items-center gap-1">
                        <Pencil size={12} />
                        编辑并入库
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== 模板编辑器 ========== */}
      {view === 'editor' && selectedTemplate && (
        <div className="max-w-4xl mx-auto" ref={editorTopRef}>
          {/* 返回按钮 */}
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 font-medium"
          >
            ← 返回模板列表
          </button>

          {/* 模板头信息 + 案例名称 */}
          <div className={`bg-gradient-to-r ${selectedTemplate.bgGradient} rounded-2xl px-6 py-5 text-white mb-5`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{selectedTemplate.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                  <span className="text-xs bg-white/20 rounded-lg px-2 py-0.5">模板</span>
                </div>
                <p className="text-sm text-white/80 mb-3">{selectedTemplate.description}</p>
                {/* 案例名称输入 */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/70 flex-shrink-0">本次案例名称：</label>
                  <input
                    type="text"
                    value={caseName}
                    onChange={e => setCaseName(e.target.value)}
                    placeholder="如：瑞幸咖啡门店巡检项目"
                    className="flex-1 bg-white/15 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 工具栏 */}
          <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles size={14} className="text-amber-500" />
              <span>编辑下方每个资产对象的内容，适配你的实际案例。修改名称会自动同步关系引用。</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetToTemplate}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                title="恢复模板原始数据"
              >
                <RotateCcw size={12} />
                重置
              </button>
              <button
                onClick={addNewObject}
                className="flex items-center gap-1 text-xs text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5 transition-colors shadow-sm"
              >
                <Plus size={12} />
                新增对象
              </button>
            </div>
          </div>

          {/* 资产对象编辑列表 */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tag size={14} className="text-amber-500" />
              资产对象（{editedObjects.length}）
              <span className="text-[10px] text-gray-400 font-normal">— 点击对象可展开查看，点击编辑图标进入编辑模式</span>
            </h4>
            <div className="space-y-2">
              {editedObjects.map((obj, idx) => {
                const color = TYPE_COLOR[obj.object_type_code] || '#4f46e5';
                const isEditing = editingIdx === idx;
                const isExpanded = expandedIdx === idx || isEditing;
                return (
                  <div key={idx} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                    isEditing ? 'border-amber-300 shadow-md bg-amber-50/30' : 'border-gray-200 hover:border-amber-200'
                  }`}>
                    {/* 对象标题栏 */}
                    <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => {
                      if (!isEditing) setExpandedIdx(isExpanded ? null : idx);
                    }}>
                      <span className="text-[10px] uppercase font-bold rounded px-2 py-0.5 flex-shrink-0"
                        style={{ backgroundColor: color + '15', color }}>
                        {TYPE_CN[obj.object_type_code] || obj.object_type_code}
                      </span>
                      <span className={`text-sm font-medium flex-1 truncate ${obj.name ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {obj.name || '（新对象 - 请编辑）'}
                      </span>
                      {obj.ai_confidence != null && !isEditing && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 rounded-full px-2 py-0.5">
                          {Math.round(obj.ai_confidence)}%
                        </span>
                      )}
                      {/* 编辑按钮 */}
                      <button
                        onClick={e => { e.stopPropagation(); setEditingIdx(isEditing ? null : idx); if (!isEditing) setExpandedIdx(idx); }}
                        className={`flex-shrink-0 transition-colors ${isEditing ? 'text-amber-600' : 'text-gray-400 hover:text-amber-500'}`}
                        title={isEditing ? '完成编辑' : '编辑此对象'}
                      >
                        {isEditing ? <Save size={14} /> : <Pencil size={14} />}
                      </button>
                      {/* 删除按钮 */}
                      <button
                        onClick={e => { e.stopPropagation(); removeObject(idx); }}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="删除此对象"
                      >
                        <Trash2 size={14} />
                      </button>
                      {!isEditing && (
                        isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>

                    {/* 编辑模式 */}
                    {isEditing && (
                      <div className="px-4 pb-4 pt-1 border-t border-amber-200 bg-amber-50/20 space-y-3">
                        {/* 类型 + 名称 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">类型</label>
                            <select
                              value={obj.object_type_code}
                              onChange={e => updateObjectField(idx, 'object_type_code', e.target.value)}
                              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                            >
                              {TYPE_OPTIONS.map(t => (
                                <option key={t.code} value={t.code}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">名称 *</label>
                            <input
                              type="text"
                              value={obj.name}
                              onChange={e => updateObjectField(idx, 'name', e.target.value)}
                              placeholder="如：瑞幸咖啡门店巡检Copilot"
                              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                            />
                          </div>
                        </div>

                        {/* 简述 */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">简述</label>
                          <textarea
                            value={obj.short_description || ''}
                            onChange={e => updateObjectField(idx, 'short_description', e.target.value)}
                            rows={2}
                            placeholder="一句话概括..."
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 resize-none"
                          />
                        </div>

                        {/* 详述 */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">详细描述</label>
                          <textarea
                            value={obj.full_description || ''}
                            onChange={e => updateObjectField(idx, 'full_description', e.target.value)}
                            rows={4}
                            placeholder="详细描述该资产的背景、功能、价值..."
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 resize-none"
                          />
                        </div>

                        {/* 标签 */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">标签（逗号分隔）</label>
                          <input
                            type="text"
                            value={obj.tags.join('，')}
                            onChange={e => updateObjectTags(idx, e.target.value)}
                            placeholder="如：巡检，瑞幸，门店管理"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                          />
                        </div>

                        {/* 外部链接 + KPI公式（按需显示） */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                              <ExternalLink size={9} /> 外部链接
                            </label>
                            <input
                              type="text"
                              value={obj.external_link || ''}
                              onChange={e => updateObjectField(idx, 'external_link', e.target.value || null)}
                              placeholder="https://..."
                              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                              <Calculator size={9} /> KPI 公式
                            </label>
                            <input
                              type="text"
                              value={obj.kpi_formula || ''}
                              onChange={e => updateObjectField(idx, 'kpi_formula', e.target.value || null)}
                              placeholder="如：成交数/客流数 × 100%"
                              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                            />
                          </div>
                        </div>

                        {/* 置信度 */}
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase flex-shrink-0">置信度</label>
                          <input
                            type="range"
                            min={0} max={100}
                            value={obj.ai_confidence ?? 80}
                            onChange={e => updateObjectField(idx, 'ai_confidence', Number(e.target.value))}
                            className="flex-1 h-1.5 accent-amber-500"
                          />
                          <span className="text-xs font-bold text-amber-600 w-10 text-right">{Math.round(obj.ai_confidence ?? 80)}%</span>
                        </div>

                        {/* 完成编辑 */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditingIdx(null)}
                            className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            <CheckCircle size={12} />
                            完成编辑
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 只读展开模式 */}
                    {isExpanded && !isEditing && (
                      <div className="px-3 pb-3 pt-0 border-t border-gray-100 bg-gray-50/50 space-y-2">
                        {obj.short_description && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-semibold text-gray-500">简述：</span>{obj.short_description}
                          </p>
                        )}
                        {obj.full_description && (
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-500">详述：</span>{obj.full_description}
                          </p>
                        )}
                        {obj.external_link && (
                          <div className="flex items-center gap-1.5">
                            <ExternalLink size={10} className="text-blue-500" />
                            <a href={obj.external_link} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate">{obj.external_link}</a>
                          </div>
                        )}
                        {obj.kpi_formula && (
                          <div className="flex items-start gap-1.5">
                            <Calculator size={10} className="text-emerald-500 mt-0.5" />
                            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 rounded px-2 py-0.5">
                              {obj.kpi_formula}
                            </span>
                          </div>
                        )}
                        {obj.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {obj.tags.map(tag => (
                              <span key={tag} className="text-[10px] bg-amber-50 text-amber-600 rounded px-1.5 py-0.5">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {editedObjects.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">所有对象已被移除，请新增对象或重置模板</p>
              )}
            </div>
          </div>

          {/* 关系编辑 */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Link2 size={14} className="text-amber-500" />
                关系（{editedRelations.length}）
              </h4>
              <button
                onClick={() => setShowAddRelation(!showAddRelation)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 transition-colors"
              >
                {showAddRelation ? <X size={12} /> : <Plus size={12} />}
                {showAddRelation ? '取消' : '新增关系'}
              </button>
            </div>

            {/* 新增关系面板 */}
            {showAddRelation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <div className="grid grid-cols-7 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">来源对象</label>
                    <select
                      value={newRelFrom}
                      onChange={e => setNewRelFrom(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">选择...</option>
                      {editedObjects.filter(o => o.name.trim()).map(o => (
                        <option key={o.name} value={o.name}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">关系</label>
                    <select
                      value={newRelType}
                      onChange={e => setNewRelType(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      {RELATION_TYPES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">目标对象</label>
                    <select
                      value={newRelTo}
                      onChange={e => setNewRelTo(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">选择...</option>
                      {editedObjects.filter(o => o.name.trim()).map(o => (
                        <option key={o.name} value={o.name}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={addRelation}
                      disabled={!newRelFrom || !newRelTo}
                      className="w-full text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 rounded-lg px-2 py-1.5 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {editedRelations.map((rel, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <span className="text-xs font-medium text-gray-800 truncate">{rel.from_name}</span>
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 rounded px-1.5 py-0.5 flex-shrink-0">
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
              {editedRelations.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">暂无关系，可点击"新增关系"添加</p>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleConfirmSave}
              disabled={saving || editedObjects.filter(o => o.name.trim()).length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${
                saving || editedObjects.filter(o => o.name.trim()).length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg'
              }`}
            >
              {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {saving ? '正在批量入库...' : `确认入库（${editedObjects.filter(o => o.name.trim()).length} 个对象 + ${editedRelations.length} 个关系）`}
            </button>
            <button
              onClick={handleBackToGrid}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
          </div>

          {/* 保存失败 */}
          {saveError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-sm font-semibold text-red-800">批量入库失败</p>
              </div>
              <p className="text-xs text-red-600 mt-1">{saveError}</p>
            </div>
          )}
        </div>
      )}

      {/* ========== 入库成功 ========== */}
      {view === 'confirm' && selectedTemplate && (
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {caseName.trim() ? `「${caseName.trim()}」` : '模板资产'} 批量入库成功！
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {saveSuccess || `已从「${selectedTemplate.name}」模板成功导入资产。`}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            所有资产已以「草稿」状态保存，可在资产库和关系图谱中查看。
          </p>

          {/* 入库摘要 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{selectedTemplate.emoji}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {caseName.trim() || selectedTemplate.name}
                </p>
                <p className="text-xs text-gray-500">基于「{selectedTemplate.name}」模板</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-2xl font-bold text-amber-600">{savedCount.objects}</p>
                <p className="text-xs text-gray-500">资产对象已入库</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-2xl font-bold text-violet-600">{savedCount.relations}</p>
                <p className="text-xs text-gray-500">关系已建立</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReuse}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-md transition-all"
            >
              <Copy size={14} />
              用同一模板创建新案例
            </button>
            <button
              onClick={handleBackToGrid}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <LayoutTemplate size={14} />
              选择其他模板
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePanel;
