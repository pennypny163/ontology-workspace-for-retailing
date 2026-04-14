/**
 * mockData.ts
 * 保留非资产库展示部分的 mock 数据（AI工作台、复用引擎、数据看板）
 * 资产库展示数据已迁移至后端 MySQL 数据库
 */

// ============================================================
// AI 提取工作台示例数据（保留，本阶段不改造）
// ============================================================
export const aiExtractionExample = {
  inputFile: '零售节日促销方案_v3.pptx',
  fileType: 'PowerPoint',
  fileSize: '4.2 MB',
  uploadedBy: '陈莎',
  uploadedAt: '2026-03-12 14:30',
  extractionSteps: [
    { step: '文档解析', status: 'complete' as const, detail: '提取了24页幻灯片，3,200字' },
    { step: '场景识别', status: 'complete' as const, detail: '识别到：促销活动助手' },
    { step: '角色识别', status: 'complete' as const, detail: '发现：营销运营、店长' },
    { step: '痛点提取', status: 'complete' as const, detail: '检测到：活动执行不一致、区域可见性弱' },
    { step: '能力映射', status: 'complete' as const, detail: '映射：任务广播、活动QA Copilot、门店完成看板' },
    { step: '资产关联', status: 'complete' as const, detail: '在现有资产库中找到3个可复用资产' },
    { step: '置信度评分', status: 'complete' as const, detail: '整体置信度：89%' },
  ],
  suggestedObjects: [
    { type: 'scenario', name: '节日促销执行追踪器', confidence: 0.92, action: 'pending' as const },
    { type: 'persona', name: '营销运营', confidence: 0.95, action: 'approved' as const },
    { type: 'persona', name: '店长', confidence: 0.93, action: 'approved' as const },
    { type: 'painPoint', name: '跨区域活动执行不一致', confidence: 0.88, action: 'pending' as const },
    { type: 'painPoint', name: '区域促销可见性弱', confidence: 0.85, action: 'pending' as const },
    { type: 'capability', name: '任务广播引擎', confidence: 0.91, action: 'approved' as const },
    { type: 'capability', name: '活动QA Copilot', confidence: 0.87, action: 'pending' as const },
    { type: 'capability', name: '门店完成看板', confidence: 0.90, action: 'pending' as const },
  ],
  relatedExistingAssets: [
    { name: '国庆促销检查清单', type: 'playbook', similarity: 0.82 },
    { name: '活动执行SOP助手', type: 'demoAsset', similarity: 0.78 },
    { name: '全国连锁零售促销试点', type: 'caseAsset', similarity: 0.75 },
  ],
  suggestedRelationships: [
    { from: '节日促销执行追踪器', to: '营销运营', label: '服务于' },
    { from: '节日促销执行追踪器', to: '店长', label: '服务于' },
    { from: '节日促销执行追踪器', to: '活动执行不一致', label: '解决' },
    { from: '节日促销执行追踪器', to: '任务广播引擎', label: '依赖' },
    { from: '节日促销执行追踪器', to: '活动QA Copilot', label: '依赖' },
  ],
};

// ============================================================
// 复用引擎推荐数据（保留，本阶段不改造）
// ============================================================
export const reuseRecommendation = {
  opportunityTitle: '大型连锁零售商 — 促销 + 巡检 + 门店运营',
  client: '巨购集团（200+门店）',
  requestSummary: '需要促销执行、门店巡检自动化和门店运营分析方面的支持',
  recommendedScenarios: [
    { name: '促销活动助手', matchScore: 0.94, status: 'published' },
    { name: '门店巡检Copilot', matchScore: 0.91, status: 'published' },
    { name: '店长日常运营助手', matchScore: 0.87, status: 'published' },
  ],
  reusableAssets: [
    { name: '节日促销工作流模板', type: 'playbook', readiness: 'ready' },
    { name: '问题分类提示词包', type: 'capability', readiness: 'ready' },
    { name: '区域巡检看板模板', type: 'demoAsset', readiness: 'ready' },
    { name: '连锁零售试点案例', type: 'caseAsset', readiness: 'ready' },
    { name: '门店SOP问答语料启动包', type: 'dataAsset', readiness: 'needs-update' },
  ],
  missingDataChecklist: [
    '客户门店层级数据',
    '现有巡检表单模板',
    '当前促销工作流文档',
    'POS系统API规格说明',
  ],
  proposalOutline: [
    '执行摘要与愿景',
    '现状痛点分析',
    '解决方案架构',
    '场景一：促销活动助手',
    '场景二：门店巡检Copilot',
    '场景三：门店运营日报看板',
    '实施路线图',
    '成功指标与KPI',
    '投资与ROI预测',
    '参考案例',
  ],
};

// ============================================================
// 数据看板指标（保留，本阶段不改造）
// ============================================================
export const dashboardMetrics = [
  { label: '资产复用率', value: '62%', delta: '+8%', trend: 'up' as const, icon: 'Recycle' },
  { label: '方案准备时间节省', value: '40%', delta: '+12%', trend: 'up' as const, icon: 'Clock' },
  { label: '重复工作减少', value: '35%', delta: '+5%', trend: 'up' as const, icon: 'MinusCircle' },
  { label: '演示生成速度', value: '2.5x', delta: '+0.8x', trend: 'up' as const, icon: 'Zap' },
  { label: '已发布可复用资产', value: '18', delta: '+4', trend: 'up' as const, icon: 'Package' },
  { label: '已覆盖零售场景', value: '6', delta: '+2', trend: 'up' as const, icon: 'ShoppingBag' },
];
