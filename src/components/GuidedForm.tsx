import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Loader, X,
  CheckCircle, AlertCircle, Search, Link2, Plus, Trash2,
  Building2, ShoppingCart, Users, AlertTriangle, Cpu, Database,
  Play, Award, BookOpen, Target, BarChart3, ArrowRight, Info,
  Upload, FileText, Paperclip, FileUp, ExternalLink, Calculator
} from 'lucide-react';
import {
  fetchAssetTypes, AssetTypeSummary,
  fetchExistingObjects, ExistingObjectItem,
  aiEnhanceForm,
  formSubmitAsset, FormSubmitRequest, FormRelation,
  uploadAttachment, FILE_REQUIRED_TYPES,
} from '../services/api';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  Users: <Users size={20} />,
  AlertTriangle: <AlertTriangle size={20} />,
  Cpu: <Cpu size={20} />,
  Database: <Database size={20} />,
  Play: <Play size={20} />,
  Award: <Award size={20} />,
  BookOpen: <BookOpen size={20} />,
  Target: <Target size={20} />,
  BarChart3: <BarChart3 size={20} />,
};

// 关系类型选项
const RELATION_OPTIONS = [
  { value: 'serves_for', label: '服务于' },
  { value: 'solves', label: '解决' },
  { value: 'depends_on', label: '依赖' },
  { value: 'measured_by', label: '由…衡量' },
  { value: 'related_to', label: '相关' },
  { value: 'belongs_to', label: '属于' },
  { value: 'validated_by', label: '被…验证' },
];

// 常用标签建议（按类型分组）
const TAG_SUGGESTIONS: Record<string, string[]> = {
  industry: ['零售', '连锁', '电商', '快消', '商超', '便利店', '购物中心'],
  scenario: ['促销', '巡检', '运营', '客服', '营销', '库存', '会员', '选址'],
  persona: ['店长', '区域经理', '营销', '督导', '运营', '总部', '加盟商'],
  pain_point: ['效率低', '不一致', '数据孤岛', '人工成本', '响应慢', '可见性差'],
  capability: ['AI助手', 'Copilot', '自动化', '数据分析', '工作流', '知识库'],
  data_asset: ['训练数据', '知识图谱', 'FAQ', 'SOP', '产品目录', '用户画像'],
  demo_asset: ['演示', 'POC', '原型', '视频', '截图', '交互demo'],
  case_asset: ['案例', '试点', '标杆', 'ROI', '客户证言', '最佳实践'],
  playbook: ['剧本', '话术', '流程', 'SOP', '检查清单', '方法论'],
  opportunity: ['商机', '客户', '投标', '需求', '预算', '决策人'],
  kpi: ['转化率', '满意度', '效率', '成本', '增长', '留存', '复购'],
};

// 名称占位提示
const NAME_PLACEHOLDER: Record<string, string> = {
  industry: '例如：连锁零售、快消品牌',
  scenario: '例如：促销活动助手、门店巡检Copilot',
  persona: '例如：门店店长、区域经理',
  pain_point: '例如：跨区域活动执行不一致',
  capability: '例如：任务广播引擎、智能问答Copilot',
  data_asset: '例如：门店SOP问答语料包',
  demo_asset: '例如：促销活动管理演示原型',
  case_asset: '例如：某连锁品牌促销试点案例',
  playbook: '例如：节日促销执行剧本',
  opportunity: '例如：大型连锁零售商促销需求',
  kpi: '例如：促销ROI提升率',
};

const DESC_PLACEHOLDER: Record<string, string> = {
  industry: '描述该行业的特征、市场规模、主要玩家...',
  scenario: '描述该场景解决什么问题、面向哪些角色、核心流程...',
  persona: '描述该角色的日常工作、关键决策、核心诉求...',
  pain_point: '描述痛点的具体表现、影响范围、造成的损失...',
  capability: '描述该能力模块的功能、技术架构、输入输出...',
  data_asset: '描述数据资产的内容、格式、规模、更新频率...',
  demo_asset: '描述演示资产的内容、展示方式、适用场景...',
  case_asset: '描述案例的客户背景、实施过程、取得的效果...',
  playbook: '描述剧本的适用场景、关键步骤、注意事项...',
  opportunity: '描述商机的客户背景、需求范围、预算规模...',
  kpi: '描述该指标的定义、计算方式、目标值...',
};

// 需要附件的资产类型的文件提示
const FILE_HINT: Record<string, { label: string; accept: string; hint: string }> = {
  case_asset: {
    label: '上传案例文档',
    accept: '.pptx,.docx,.pdf,.txt,.md,.xlsx',
    hint: '请上传案例的原始文档（PPT方案、Word报告、PDF文件等），此为必填项',
  },
  demo_asset: {
    label: '上传演示文件',
    accept: '.pptx,.pdf,.zip,.mp4,.html,.docx,.png,.jpg,.gif',
    hint: '请上传演示相关文件（PPT演示、视频录屏、截图、ZIP包等），此为必填项',
  },
  data_asset: {
    label: '上传数据文件',
    accept: '.xlsx,.csv,.json,.txt,.zip,.sql,.xml,.tsv,.md,.docx,.pdf',
    hint: '请上传数据资产文件（Excel数据、CSV、JSON、SQL脚本、ZIP包等），此为必填项',
  },
  playbook: {
    label: '上传操作手册文档',
    accept: '.pptx,.docx,.pdf,.txt,.md,.xlsx',
    hint: '请上传操作手册/剧本的原始文档（Word、PDF、PPT等），此为必填项',
  },
};

// 需要外部链接的资产类型
const LINK_TYPES = new Set(['capability']);
const LINK_HINT: Record<string, { label: string; placeholder: string; hint: string }> = {
  capability: {
    label: '能力介绍链接',
    placeholder: 'https://example.com/product/xxx',
    hint: '请填写对应产品/能力的介绍页面URL，方便他人快速了解该能力详情',
  },
};

// 需要公式的资产类型
const FORMULA_TYPES = new Set(['kpi']);
// KPI 公式中可引用的已有指标占位列表
const KPI_BASE_METRICS = [
  '转化率', '客单价', '满意度', '复购率', '留存率',
  '客流量', '坪效', '人效', '库存周转率', '毛利率',
  '订单量', '退货率', '响应时间', '解决率',
];

// 文件大小格式化
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

interface GuidedFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const GuidedForm: React.FC<GuidedFormProps> = ({ onClose, onSuccess }) => {
  // 步骤控制
  const [step, setStep] = useState(0);

  // Step 0: 选择资产类型
  const [assetTypes, setAssetTypes] = useState<AssetTypeSummary[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('');

  // Step 1: 基本信息
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 附件上传
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentUploaded, setAttachmentUploaded] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState<{
    filename: string;
    stored_path: string;
    file_size: number;
  } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // AI 增强
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // 能力模块外部链接
  const [externalLink, setExternalLink] = useState('');

  // KPI 公式
  const [kpiFormula, setKpiFormula] = useState('');

  // Step 2: 关系
  const [relations, setRelations] = useState<(FormRelation & { targetName: string; targetTypeName: string })[]>([]);
  const [existingObjects, setExistingObjects] = useState<ExistingObjectItem[]>([]);
  const [objSearchKey, setObjSearchKey] = useState('');
  const [objSearchLoading, setObjSearchLoading] = useState(false);
  const [showObjPicker, setShowObjPicker] = useState(false);
  const [pendingRelationType, setPendingRelationType] = useState('related_to');

  // Step 3: 提交
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // 是否是需要附件的类型
  const needsFile = FILE_REQUIRED_TYPES.has(selectedTypeCode);
  const fileHint = FILE_HINT[selectedTypeCode];

  // 是否需要外部链接
  const needsLink = LINK_TYPES.has(selectedTypeCode);
  const linkHint = LINK_HINT[selectedTypeCode];

  // 是否需要KPI公式
  const needsFormula = FORMULA_TYPES.has(selectedTypeCode);

  // 加载资产类型
  useEffect(() => {
    fetchAssetTypes()
      .then(data => { setAssetTypes(data); setTypesLoading(false); })
      .catch(() => setTypesLoading(false));
  }, []);

  // 搜索已有资产
  const searchExistingObjects = useCallback(async (keyword: string) => {
    setObjSearchLoading(true);
    try {
      const data = await fetchExistingObjects(keyword, '', 30);
      setExistingObjects(data);
    } catch { /* ignore */ }
    setObjSearchLoading(false);
  }, []);

  // 进入关系步骤时加载已有资产
  useEffect(() => {
    if (step === 2) {
      searchExistingObjects('');
    }
  }, [step, searchExistingObjects]);

  // 选中类型信息
  const selectedType = assetTypes.find(t => t.code === selectedTypeCode);
  const suggestedTags = TAG_SUGGESTIONS[selectedTypeCode] || [];

  // 添加标签
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  };

  // 附件上传处理
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setAttachmentFile(file);
    setAttachmentUploading(true);
    setAttachmentError(null);
    setAttachmentUploaded(false);
    setAttachmentInfo(null);

    try {
      const result = await uploadAttachment(file);
      setAttachmentInfo({
        filename: result.filename,
        stored_path: result.stored_path,
        file_size: result.file_size,
      });
      setAttachmentUploaded(true);
    } catch (err: any) {
      setAttachmentError(err.message || '附件上传失败');
      setAttachmentFile(null);
    } finally {
      setAttachmentUploading(false);
    }
  }, []);

  // 移除附件
  const removeAttachment = useCallback(() => {
    setAttachmentFile(null);
    setAttachmentUploaded(false);
    setAttachmentInfo(null);
    setAttachmentError(null);
  }, []);

  // AI 增强
  const handleAIEnhance = async () => {
    if (!name.trim()) return;
    setEnhancing(true);
    try {
      const result = await aiEnhanceForm({
        object_type_code: selectedTypeCode,
        name: name.trim(),
        short_description: shortDesc.trim() || undefined,
        tags,
      });
      if (result.full_description && !fullDesc.trim()) {
        setFullDesc(result.full_description);
      }
      if (result.suggested_tags && result.suggested_tags.length > 0) {
        const newTags = result.suggested_tags.filter((t: string) => !tags.includes(t));
        setTags(prev => [...prev, ...newTags.slice(0, 5 - prev.length)]);
      }
      if (result.ai_confidence) {
        setAiConfidence(result.ai_confidence);
      }
      setEnhanced(true);
    } catch { /* ignore errors */ }
    setEnhancing(false);
  };

  // 添加关系
  const addRelation = (obj: ExistingObjectItem) => {
    if (relations.some(r => r.target_object_id === obj.id)) return;
    setRelations(prev => [...prev, {
      target_object_id: obj.id,
      relation_type: pendingRelationType,
      targetName: obj.name,
      targetTypeName: obj.object_type_name,
    }]);
    setShowObjPicker(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const req: FormSubmitRequest = {
        object_type_code: selectedTypeCode,
        name: name.trim(),
        short_description: shortDesc.trim() || undefined,
        full_description: fullDesc.trim() || undefined,
        tags,
        ai_confidence: aiConfidence ?? undefined,
        relations: relations.map(r => ({
          target_object_id: r.target_object_id,
          relation_type: r.relation_type,
          remark: undefined,
        })),
        created_by: '表单贡献',
        attachment_filename: attachmentInfo?.filename,
        attachment_path: attachmentInfo?.stored_path,
        attachment_size: attachmentInfo?.file_size,
        external_link: externalLink.trim() || undefined,
        kpi_formula: kpiFormula.trim() || undefined,
      };
      const resp = await formSubmitAsset(req);
      setSubmitResult({ success: true, message: resp.message });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2500);
    } catch (err: any) {
      setSubmitResult({ success: false, message: err.message || '提交失败' });
    }
    setSubmitting(false);
  };

  // 能否前进
  const canNext = () => {
    if (step === 0) return !!selectedTypeCode;
    if (step === 1) {
      if (!name.trim()) return false;
      // 需要附件的类型必须先上传附件
      if (needsFile && !attachmentUploaded) return false;
      return true;
    }
    return true;
  };

  const stepLabels = ['选择类型', '填写信息', '建立关系', '预览确认'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* 主面板 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">引导式贡献表单</h2>
            <p className="text-xs text-gray-500 mt-0.5">跟随向导逐步填写，轻松创建资产</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* 步骤条 */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-brand-600 text-white shadow-md' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${i === step ? 'text-brand-600' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 内容区（可滚动） */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ===== Step 0: 选择类型 ===== */}
          {step === 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">选择要创建的资产类型</h3>
                <p className="text-xs text-gray-500">选择最匹配的类型，不确定也没关系 — 后续可以修改。</p>
              </div>

              {/* 分类提示 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  纯信息型 — 仅需填写信息
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  文件型 — 需上传附件
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  链接型 — 附带产品链接
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  公式型 — 可配计算公式
                </div>
              </div>

              {typesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size={20} className="text-brand-500 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">加载资产类型...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {assetTypes.map(at => {
                    const isFileType = FILE_REQUIRED_TYPES.has(at.code);
                    return (
                      <button
                        key={at.code}
                        onClick={() => {
                          setSelectedTypeCode(at.code);
                          // 切换类型时清除附件状态
                          removeAttachment();
                        }}
                        className={`text-left rounded-xl p-3 border-2 transition-all duration-150 ${
                          selectedTypeCode === at.code
                            ? 'border-brand-400 bg-brand-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: (at.color || '#4f46e5') + '15', color: at.color || '#4f46e5' }}
                          >
                            {iconMap[at.icon_name || ''] || <Database size={18} />}
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            {/* 类型标识 */}
                            {isFileType && (
                              <span className="text-[9px] bg-amber-50 text-amber-600 rounded px-1 py-0.5 font-medium flex items-center gap-0.5">
                                <Paperclip size={8} />
                                附件
                              </span>
                            )}
                            {LINK_TYPES.has(at.code) && (
                              <span className="text-[9px] bg-blue-50 text-blue-600 rounded px-1 py-0.5 font-medium flex items-center gap-0.5">
                                <ExternalLink size={8} />
                                链接
                              </span>
                            )}
                            {FORMULA_TYPES.has(at.code) && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 rounded px-1 py-0.5 font-medium flex items-center gap-0.5">
                                <Calculator size={8} />
                                公式
                              </span>
                            )}
                            {selectedTypeCode === at.code && (
                              <CheckCircle size={14} className="text-brand-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{at.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{at.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-400">{at.record_count} 条已有记录</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${isFileType ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 选中了需要附件的类型时的提示 */}
              {selectedTypeCode && needsFile && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 animate-fade-in-up">
                  <Paperclip size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">此类型需要上传原始文件</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      「{selectedType?.name}」类型的资产核心价值在于原始文件/数据，在下一步填写信息时请同时上传相关文件。
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== Step 1: 填写基本信息 ===== */}
          {step === 1 && selectedType && (
            <div className="space-y-5">
              {/* 类型提示 */}
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (selectedType.color || '#4f46e5') + '15', color: selectedType.color || '#4f46e5' }}
                >
                  {iconMap[selectedType.icon_name || ''] || <Database size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-brand-800">正在创建「{selectedType.name}」类型资产</p>
                  <p className="text-[10px] text-brand-600">{selectedType.description}</p>
                </div>
                {needsFile && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium flex items-center gap-1 flex-shrink-0">
                    <Paperclip size={9} />
                    需要附件
                  </span>
                )}
              </div>

              {/* ===== 附件上传区域（仅对需要文件的类型显示） ===== */}
              {needsFile && fileHint && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    {fileHint.label}
                    <span className="text-red-500">*</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 font-medium">必填</span>
                  </label>

                  {!attachmentUploaded && !attachmentUploading && (
                    <div
                      className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-400 transition-all cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileUp size={28} className="mx-auto mb-2 text-amber-400" />
                      <p className="text-xs font-semibold text-gray-700 mb-1">点击上传或拖放文件到此处</p>
                      <p className="text-[10px] text-gray-500">{fileHint.hint}</p>
                      <p className="text-[10px] text-gray-400 mt-1">支持的格式：{fileHint.accept.replace(/\./g, '').replace(/,/g, '、').toUpperCase()}</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileHint.accept}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* 上传中 */}
                  {attachmentUploading && (
                    <div className="border border-brand-200 rounded-xl p-4 bg-brand-50/30 flex items-center gap-3">
                      <Loader size={18} className="text-brand-500 animate-spin flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-700">正在上传 {attachmentFile?.name}...</p>
                        <p className="text-[10px] text-gray-500">{attachmentFile ? formatFileSize(attachmentFile.size) : ''}</p>
                      </div>
                    </div>
                  )}

                  {/* 上传成功 */}
                  {attachmentUploaded && attachmentInfo && (
                    <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{attachmentInfo.filename}</p>
                        <p className="text-[10px] text-gray-500">{formatFileSize(attachmentInfo.file_size)} · 上传成功</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <button
                          onClick={() => {
                            removeAttachment();
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="移除附件"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 上传错误 */}
                  {attachmentError && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600">{attachmentError}</span>
                      <button
                        onClick={() => { setAttachmentError(null); fileInputRef.current?.click(); }}
                        className="ml-auto text-xs text-red-500 underline flex-shrink-0"
                      >
                        重试
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 名称（必填） */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  资产名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={NAME_PLACEHOLDER[selectedTypeCode] || '输入名称...'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                  maxLength={200}
                />
                <p className="text-[10px] text-gray-400 mt-1">简洁且有辨识度的名称，方便他人搜索和复用</p>
              </div>

              {/* 简述 */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">简要描述</label>
                <textarea
                  value={shortDesc}
                  onChange={e => setShortDesc(e.target.value)}
                  placeholder={DESC_PLACEHOLDER[selectedTypeCode] || '简要描述...'}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all resize-none"
                  maxLength={500}
                />
              </div>

              {/* ===== 能力模块外部链接（仅 capability 类型显示） ===== */}
              {needsLink && linkHint && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <ExternalLink size={12} className="text-blue-500" />
                    {linkHint.label}
                  </label>
                  <div className="relative">
                    <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={externalLink}
                      onChange={e => setExternalLink(e.target.value)}
                      placeholder={linkHint.placeholder}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{linkHint.hint}</p>
                  {/* 快捷链接模板 */}
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-400 mb-1">🔗 常用能力页面</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '企点客服', url: 'https://example.com/product/qidian' },
                        { label: '智能对话平台', url: 'https://example.com/product/tbp' },
                        { label: '自然语言处理', url: 'https://example.com/product/nlp' },
                        { label: '通用大模型', url: 'https://example.com/product/hunyuan' },
                        { label: '云BI', url: 'https://example.com/product/bi' },
                        { label: '数据万象', url: 'https://example.com/product/ci' },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={() => setExternalLink(item.url)}
                          className={`text-[10px] rounded-lg px-2 py-1 transition-all border ${
                            externalLink === item.url
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-gray-50 text-gray-600 border-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== KPI 公式输入（仅 kpi 类型显示） ===== */}
              {needsFormula && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calculator size={12} className="text-emerald-500" />
                    计算公式
                    <span className="text-[10px] text-gray-400 font-normal">（可选）</span>
                  </label>
                  <div className="relative">
                    <Calculator size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={kpiFormula}
                      onChange={e => setKpiFormula(e.target.value)}
                      placeholder="例如：(本月复购订单数 / 本月总订单数) × 100%"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">定义该KPI的计算方式，引用已有指标构建公式（如：转化率 = 成交客户数 / 进店客户数 × 100%）</p>
                  {/* 可引用的已有指标快捷插入 */}
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-400 mb-1">📊 点击插入已有基础指标</p>
                    <div className="flex flex-wrap gap-1.5">
                      {KPI_BASE_METRICS.map(metric => (
                        <button
                          key={metric}
                          onClick={() => setKpiFormula(prev => prev ? `${prev} ${metric}` : metric)}
                          className="text-[10px] bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200"
                        >
                          + {metric}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 公式预览 */}
                  {kpiFormula && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">公式预览</p>
                      <p className="text-xs font-mono text-gray-800 bg-white rounded px-2 py-1.5 border border-gray-100">
                        {kpiFormula}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 标签 */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">标签</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-600 rounded-lg px-2 py-1 group">
                      {tag}
                      <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-brand-400 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && <span className="text-[10px] text-gray-400">点击下方建议标签或手动输入</span>}
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="输入标签后按回车..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="text-xs bg-gray-100 text-gray-600 rounded-lg px-3 py-1.5 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    添加
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">💡 推荐标签（点击添加）</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.filter(t => !tags.includes(t)).map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="text-[10px] bg-gray-50 text-gray-600 rounded-lg px-2 py-1 hover:bg-brand-50 hover:text-brand-600 transition-colors border border-transparent hover:border-brand-200"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI 增强按钮 */}
              <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-brand-800 mb-1">AI 智能增强</p>
                    <p className="text-[10px] text-brand-600 mb-2.5">
                      填写名称后，可让 AI 自动补充详细描述、推荐标签，并评估信息置信度。
                    </p>
                    <button
                      onClick={handleAIEnhance}
                      disabled={enhancing || !name.trim()}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3.5 py-1.5 transition-all ${
                        enhancing ? 'bg-brand-200 text-brand-700 cursor-wait' :
                        !name.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                        'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                      }`}
                    >
                      {enhancing ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {enhancing ? 'AI 正在分析...' : enhanced ? '重新增强' : '一键 AI 增强'}
                    </button>
                    {enhanced && (
                      <span className="ml-2 text-[10px] text-emerald-600 font-medium">✓ 已增强</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI 增强后显示详细描述编辑区 */}
              {fullDesc && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    详细描述
                    {enhanced && <span className="text-[10px] text-brand-500 bg-brand-50 rounded px-1.5 py-0.5 font-medium">AI 生成</span>}
                  </label>
                  <textarea
                    value={fullDesc}
                    onChange={e => setFullDesc(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* ===== Step 2: 建立关系 ===== */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">关联已有资产（可选）</h3>
                <p className="text-xs text-gray-500">
                  选择与「{name}」相关的已有资产建立关联。这一步是可选的，你可以直接跳过。
                </p>
              </div>

              {/* 已添加的关系 */}
              {relations.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">已添加的关系（{relations.length}）</p>
                  <div className="space-y-1.5">
                    {relations.map((rel, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                        <span className="text-xs font-medium text-brand-700 truncate">{name}</span>
                        <span className="text-[10px] text-white bg-brand-500 rounded px-1.5 py-0.5 flex-shrink-0">
                          {RELATION_OPTIONS.find(r => r.value === rel.relation_type)?.label || rel.relation_type}
                        </span>
                        <span className="text-xs font-medium text-gray-800 truncate">{rel.targetName}</span>
                        <span className="text-[10px] text-gray-400">({rel.targetTypeName})</span>
                        <button
                          onClick={() => setRelations(prev => prev.filter((_, i) => i !== idx))}
                          className="ml-auto text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 添加关系 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus size={14} className="text-brand-500" />
                  <p className="text-xs font-semibold text-gray-700">添加新关系</p>
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-gray-500 mb-1 block">关系类型</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPendingRelationType(opt.value)}
                        className={`text-[10px] rounded-lg px-2.5 py-1 font-medium transition-all ${
                          pendingRelationType === opt.value
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] text-gray-500 mb-1 block">搜索已有资产</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={objSearchKey}
                      onChange={e => { setObjSearchKey(e.target.value); searchExistingObjects(e.target.value); }}
                      onFocus={() => setShowObjPicker(true)}
                      placeholder="输入关键词搜索资产..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                    />
                  </div>
                  {showObjPicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                      {objSearchLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader size={14} className="text-brand-500 animate-spin mr-2" />
                          <span className="text-xs text-gray-500">搜索中...</span>
                        </div>
                      ) : existingObjects.length === 0 ? (
                        <div className="py-4 text-center text-xs text-gray-400">无匹配的资产</div>
                      ) : (
                        existingObjects
                          .filter(obj => !relations.some(r => r.target_object_id === obj.id))
                          .map(obj => (
                            <button
                              key={obj.id}
                              onClick={() => addRelation(obj)}
                              className="w-full text-left px-3 py-2 hover:bg-brand-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                            >
                              <span className="text-xs font-medium text-gray-800 truncate">{obj.name}</span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">({obj.object_type_name})</span>
                              <Plus size={12} className="text-brand-400 ml-auto flex-shrink-0" />
                            </button>
                          ))
                      )}
                      <button
                        onClick={() => setShowObjPicker(false)}
                        className="w-full text-center text-[10px] text-gray-400 py-2 hover:bg-gray-50"
                      >
                        关闭
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-400">
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <span>关系会将新资产与已有资产关联起来，有助于构建更完整的知识图谱。此步骤可跳过。</span>
              </div>
            </div>
          )}

          {/* ===== Step 3: 预览确认 ===== */}
          {step === 3 && selectedType && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">确认并提交</h3>
                <p className="text-xs text-gray-500">请检查以下信息，确认无误后提交入库。资产将以「草稿」状态保存。</p>
              </div>

              {/* 预览卡片 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* 类型头 */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2"
                  style={{ backgroundColor: (selectedType.color || '#4f46e5') + '08' }}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: (selectedType.color || '#4f46e5') + '15', color: selectedType.color || '#4f46e5' }}
                  >
                    {iconMap[selectedType.icon_name || ''] || <Database size={18} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase" style={{ color: selectedType.color || '#4f46e5' }}>
                      {selectedType.name}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{name}</h4>
                  </div>
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">草稿</span>
                </div>

                <div className="p-4 space-y-3">
                  {/* 附件信息 */}
                  {attachmentInfo && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <Paperclip size={10} className="text-amber-500" />
                        附件文件
                      </p>
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        <FileText size={16} className="text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{attachmentInfo.filename}</p>
                          <p className="text-[10px] text-gray-500">{formatFileSize(attachmentInfo.file_size)}</p>
                        </div>
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      </div>
                    </div>
                  )}

                  {/* 简述 */}
                  {shortDesc && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-0.5">简要描述</p>
                      <p className="text-xs text-gray-700">{shortDesc}</p>
                    </div>
                  )}

                  {/* 外部链接 */}
                  {externalLink && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <ExternalLink size={10} className="text-blue-500" />
                        能力介绍链接
                      </p>
                      <a
                        href={externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <ExternalLink size={12} />
                        <span className="truncate max-w-[350px]">{externalLink}</span>
                      </a>
                    </div>
                  )}

                  {/* KPI 公式 */}
                  {kpiFormula && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <Calculator size={10} className="text-emerald-500" />
                        计算公式
                      </p>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <p className="text-xs font-mono text-emerald-800">{kpiFormula}</p>
                      </div>
                    </div>
                  )}

                  {/* 详述 */}
                  {fullDesc && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-0.5 flex items-center gap-1">
                        详细描述
                        {enhanced && <Sparkles size={10} className="text-brand-500" />}
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">{fullDesc}</p>
                    </div>
                  )}

                  {/* 标签 */}
                  {tags.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">标签</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-brand-50 text-brand-600 rounded-lg px-2 py-0.5">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI 置信度 */}
                  {aiConfidence != null && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">AI 置信度</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 max-w-[200px]">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${aiConfidence}%` }} />
                        </div>
                        <span className="text-xs font-bold text-brand-600">{Math.round(aiConfidence)}%</span>
                      </div>
                    </div>
                  )}

                  {/* 关系 */}
                  {relations.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">关联关系（{relations.length}）</p>
                      <div className="space-y-1">
                        {relations.map((rel, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="text-gray-800 font-medium">{name}</span>
                            <ArrowRight size={10} className="text-gray-400" />
                            <span className="text-brand-500 text-[10px] font-semibold">
                              {RELATION_OPTIONS.find(r => r.value === rel.relation_type)?.label}
                            </span>
                            <ArrowRight size={10} className="text-gray-400" />
                            <span className="text-gray-800 font-medium">{rel.targetName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 提交结果 */}
              {submitResult && (
                <div className={`mt-4 rounded-xl p-4 flex items-start gap-2 animate-fade-in-up ${
                  submitResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {submitResult.success ? (
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${submitResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {submitResult.success ? '提交成功！' : '提交失败'}
                    </p>
                    <p className={`text-xs mt-0.5 ${submitResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {submitResult.message}
                      {submitResult.success && ' 即将关闭...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
            {step > 0 ? '上一步' : '取消'}
          </button>

          <div className="flex items-center gap-2">
            {/* 附件未上传时在 step1 显示提示 */}
            {step === 1 && needsFile && !attachmentUploaded && (
              <span className="text-[10px] text-amber-600 flex items-center gap-1">
                <Paperclip size={10} />
                需先上传附件
              </span>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className={`flex items-center gap-1.5 text-sm font-semibold rounded-xl px-5 py-2 transition-all ${
                  canNext()
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step === 2 ? '预览确认' : '下一步'}
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !!submitResult?.success}
                className={`flex items-center gap-1.5 text-sm font-semibold rounded-xl px-5 py-2 transition-all ${
                  submitting || submitResult?.success
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                }`}
              >
                {submitting ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {submitting ? '提交中...' : '确认提交入库'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedForm;