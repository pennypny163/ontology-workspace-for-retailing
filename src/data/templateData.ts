/**
 * 零售行业解决方案模板数据
 * 每个模板包含完整的资产对象包+关系定义，可一键批量入库
 */

export interface TemplateObject {
  object_type_code: string;
  name: string;
  short_description: string;
  full_description: string;
  tags: string[];
  ai_confidence: number;
  external_link?: string;
  kpi_formula?: string;
}

export interface TemplateRelation {
  from_name: string;
  to_name: string;
  relation_type: string;
  remark: string;
}

export interface RetailTemplate {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  subtitle: string;
  description: string;
  targetUsers: string[];
  applicableIndustry: string;
  estimatedTime: string;
  objects: TemplateObject[];
  relations: TemplateRelation[];
}

// ============================================================
// 模板 1：零售促销活动全链路
// ============================================================
const promoTemplate: RetailTemplate = {
  id: 'promo_campaign',
  name: '零售促销活动全链路',
  emoji: '🎯',
  color: '#e11d48',
  bgGradient: 'from-rose-500 to-pink-600',
  subtitle: '从促销规划到执行追踪的完整资产包',
  description:
    '覆盖连锁零售企业在节假日促销、周年庆、主题促销等场景下的全链路，包括目标场景、核心角色、关键痛点、能力模块和衡量指标。适合需要快速搭建促销数字化解决方案的团队。',
  targetUsers: ['售前解决方案架构师', '零售行业销售', '产品经理'],
  applicableIndustry: '连锁零售 / 商超 / 便利店',
  estimatedTime: '< 1 分钟完成入库',
  objects: [
    {
      object_type_code: 'scenario',
      name: '促销活动执行追踪器',
      short_description: '帮助连锁门店总部实时追踪各门店促销活动执行进度、合规性和效果的数字化工具。',
      full_description:
        '促销活动执行追踪器面向拥有50家以上门店的连锁零售企业，解决总部对各门店促销活动执行"看不见、管不到"的核心痛点。系统支持总部一键下发促销任务包（含陈列标准、价签更换、赠品分配等），门店通过移动端逐项打卡上报，总部实时查看完成热力图。核心功能包括：任务自动拆解与下发、门店执行拍照打卡、AI 自动审核陈列合规、区域完成率排行榜、异常预警与督导介入机制。',
      tags: ['促销', '连锁零售', '执行追踪', '数字化', '任务管理'],
      ai_confidence: 92,
    },
    {
      object_type_code: 'persona',
      name: '营销运营经理',
      short_description: '负责制定和推动连锁门店促销活动策略的总部核心角色。',
      full_description:
        '营销运营经理通常属于总部市场或运营部门，日常负责：制定月度/季度促销计划、设计促销活动方案（折扣力度、赠品策略、陈列要求）、协调采购和物流备货、下发执行标准到各区域/门店、追踪活动执行进度和效果、撰写活动复盘报告。核心诉求是"活动方案能被100%落地执行，而不是在传达过程中层层打折"。',
      tags: ['总部角色', '营销', '策略制定', '活动管理'],
      ai_confidence: 95,
    },
    {
      object_type_code: 'persona',
      name: '门店店长',
      short_description: '负责单个门店日常运营和促销活动落地执行的一线管理者。',
      full_description:
        '门店店长是促销活动的最终执行人。日常工作包括：接收总部促销指令、分配店员执行任务（更换价签、布置陈列、分发赠品）、监督执行质量、反馈门店实际情况（库存不足、场地限制等）。核心痛点是"接到的活动指令太多、标准不清晰、缺乏执行工具"。',
      tags: ['一线角色', '门店管理', '执行者'],
      ai_confidence: 93,
    },
    {
      object_type_code: 'pain_point',
      name: '跨区域促销执行一致性差',
      short_description: '总部活动方案传递到各区域、各门店后，执行标准层层变形，最终落地效果参差不齐。',
      full_description:
        '在200+门店的连锁体系中，一次促销活动从总部方案到门店执行通常经过3~4层传达（总部→大区→城市→门店），信息损耗导致：30%的门店陈列不符合标准、15%的门店价签更换不及时、赠品分配不均等问题。直接造成促销ROI低于预期20-30%，且总部缺乏有效的监控手段。',
      tags: ['执行偏差', '信息损耗', '管理盲区', '连锁管理'],
      ai_confidence: 90,
    },
    {
      object_type_code: 'pain_point',
      name: '活动效果难以实时量化',
      short_description: '促销活动期间缺乏实时数据看板，总部只能在活动结束后数天才能看到效果数据。',
      full_description:
        '传统促销活动的效果评估依赖Excel汇总，从门店上报→区域汇总→总部分析，通常需要3-5个工作日。这意味着在7天的促销周期中，前半段的执行偏差无法被及时发现和纠正。核心需求是实时的促销执行看板和效果预警机制。',
      tags: ['数据滞后', '效果评估', '实时性'],
      ai_confidence: 88,
    },
    {
      object_type_code: 'capability',
      name: '任务广播与执行引擎',
      short_description: '支持总部一键将促销任务包拆解并精准下发到指定门店/区域的自动化引擎。',
      full_description:
        '任务广播与执行引擎是促销数字化的核心能力模块。支持：按门店类型/区域/等级差异化下发任务、任务自动拆解为可执行检查项、移动端逐项打卡上报（文字+拍照）、执行进度实时汇总看板、超时自动预警与升级机制。底层基于云服务消息推送和工作流引擎构建。',
      tags: ['任务管理', '自动化', '工作流', '云服务'],
      ai_confidence: 91,
      external_link: 'https://https://example.com/product/tbp',
    },
    {
      object_type_code: 'capability',
      name: 'AI 陈列合规审核',
      short_description: '通过计算机视觉自动审核门店促销陈列照片是否符合总部标准。',
      full_description:
        'AI 陈列合规审核模块利用计算机视觉技术，对门店上传的陈列执行照片进行自动化审核。能识别：陈列位置是否正确、商品排面是否达标、价签是否更换、促销POP是否张贴等。审核通过率>90%的自动放行，不合规的标记问题点并推送整改通知。基于云服务万象图像识别能力构建。',
      tags: ['AI', '计算机视觉', '合规审核', '图像识别'],
      ai_confidence: 87,
      external_link: 'https://https://example.com/product/ci',
    },
    {
      object_type_code: 'kpi',
      name: '促销活动ROI',
      short_description: '衡量单次促销活动投入产出比的核心指标。',
      full_description:
        '促销活动ROI = (促销期间增量销售额 - 促销总成本) / 促销总成本 × 100%。其中促销总成本包括：折扣让利金额、赠品成本、陈列物料费用、人力加班费等。目标值：单次活动ROI ≥ 150%。行业基准：优秀零售企业促销ROI在120%-200%区间。',
      tags: ['ROI', '投入产出', '核心指标'],
      ai_confidence: 94,
      kpi_formula: '(促销期间增量销售额 - 促销总成本) / 促销总成本 × 100%',
    },
    {
      object_type_code: 'kpi',
      name: '门店执行达标率',
      short_description: '衡量各门店促销活动执行是否符合总部标准的比例指标。',
      full_description:
        '门店执行达标率 = 检查项合格数 / 总检查项数 × 100%。检查维度包括陈列合规、价签更换及时率、赠品分发准确率等。目标值：≥ 90%。当某区域达标率低于80%时自动触发督导巡查。',
      tags: ['执行力', '合规', '达标率'],
      ai_confidence: 91,
      kpi_formula: '检查项合格数 / 总检查项数 × 100%',
    },
  ],
  relations: [
    { from_name: '促销活动执行追踪器', to_name: '营销运营经理', relation_type: 'serves_for', remark: '场景服务于营销运营经理' },
    { from_name: '促销活动执行追踪器', to_name: '门店店长', relation_type: 'serves_for', remark: '场景服务于门店店长' },
    { from_name: '促销活动执行追踪器', to_name: '跨区域促销执行一致性差', relation_type: 'solves', remark: '场景解决执行一致性问题' },
    { from_name: '促销活动执行追踪器', to_name: '活动效果难以实时量化', relation_type: 'solves', remark: '场景解决效果量化问题' },
    { from_name: '促销活动执行追踪器', to_name: '任务广播与执行引擎', relation_type: 'depends_on', remark: '场景依赖任务引擎' },
    { from_name: '促销活动执行追踪器', to_name: 'AI 陈列合规审核', relation_type: 'depends_on', remark: '场景依赖AI审核' },
    { from_name: '促销活动ROI', to_name: '促销活动执行追踪器', relation_type: 'measured_by', remark: 'KPI衡量场景效果' },
    { from_name: '门店执行达标率', to_name: '促销活动执行追踪器', relation_type: 'measured_by', remark: 'KPI衡量执行质量' },
  ],
};

// ============================================================
// 模板 2：门店智能巡检
// ============================================================
const inspectionTemplate: RetailTemplate = {
  id: 'store_inspection',
  name: '门店智能巡检 Copilot',
  emoji: '📋',
  color: '#2563eb',
  bgGradient: 'from-blue-500 to-indigo-600',
  subtitle: '巡检流程自动化 + AI辅助合规评估',
  description:
    '面向区域督导和门店管理层，将传统纸质巡检流程数字化，通过AI辅助自动评分和生成整改报告。适用于门店卫生、安全、陈列、服务质量等多维度巡检场景。',
  targetUsers: ['区域督导', '运营总监', 'IT部门'],
  applicableIndustry: '连锁零售 / 餐饮 / 便利店',
  estimatedTime: '< 1 分钟完成入库',
  objects: [
    {
      object_type_code: 'scenario',
      name: '门店巡检 Copilot',
      short_description: '为区域督导提供智能巡检助手，自动化巡检流程并生成合规报告。',
      full_description:
        '门店巡检Copilot将传统纸质巡检表转化为移动端智能巡检流程。督导到店后，系统自动加载该门店的巡检模板（可按门店类型差异化配置），逐项检查并支持拍照取证。AI自动识别照片中的问题（如地面脏污、商品过期、消防通道堵塞等），巡检完成后自动生成评分报告和整改建议，并将整改任务下发到门店负责人。历史巡检数据形成趋势图，帮助管理层识别系统性问题。',
      tags: ['巡检', '合规', 'AI助手', '移动端', '数字化'],
      ai_confidence: 93,
    },
    {
      object_type_code: 'persona',
      name: '区域督导',
      short_description: '负责多家门店日常巡检、标准执行监督和整改跟进的管理角色。',
      full_description:
        '区域督导通常管理10-30家门店，每月需完成固定次数的门店巡检。工作内容包括：按计划到店巡检（卫生、安全、陈列、服务等维度）、记录问题并拍照取证、与店长沟通整改方案、跟踪整改进度、向总部提交巡检报告。核心诉求是"巡检效率提升、报告自动生成、整改可追溯"。',
      tags: ['管理角色', '巡检', '督导', '区域管理'],
      ai_confidence: 94,
    },
    {
      object_type_code: 'pain_point',
      name: '纸质巡检效率低且数据难沉淀',
      short_description: '传统纸质巡检表填写耗时、照片与检查项脱节、历史数据无法横向对比分析。',
      full_description:
        '每次门店巡检平均耗时2-3小时，其中30-40%的时间用于填写纸质表单和整理照片。巡检完成后需要1-2天撰写报告，且纸质记录无法被系统化分析。管理层无法快速看到：哪些门店问题最多、哪类问题反复出现、整改是否到位。这导致巡检沦为"走过场"，无法真正驱动门店管理水平提升。',
      tags: ['效率低', '数据孤岛', '纸质流程', '分析缺失'],
      ai_confidence: 90,
    },
    {
      object_type_code: 'pain_point',
      name: '巡检标准不统一导致评分主观',
      short_description: '不同督导对同一检查项的评判标准不一致，导致巡检评分缺乏可比性。',
      full_description:
        '在缺乏标准化评分体系的情况下，同一家门店被不同督导巡检可能得到差异20分以上的评分结果。这使得门店排名和整改优先级缺乏说服力。需要AI辅助评分来确保一致性和客观性。',
      tags: ['标准不一', '主观评分', '一致性'],
      ai_confidence: 88,
    },
    {
      object_type_code: 'capability',
      name: '智能巡检表单引擎',
      short_description: '支持按门店类型、巡检类别动态生成差异化巡检表单的配置化引擎。',
      full_description:
        '智能巡检表单引擎允许总部运营团队通过拖拽式配置器定义巡检模板。支持：多级分类（卫生/安全/陈列/服务）、权重设置、必检项和抽检项、拍照必填项、评分规则（合格/不合格/部分合格）、按门店类型差异化生成。巡检模板变更自动同步到所有督导移动端。',
      tags: ['表单引擎', '配置化', '巡检模板'],
      ai_confidence: 90,
    },
    {
      object_type_code: 'capability',
      name: 'AI 巡检报告生成器',
      short_description: '基于巡检数据和照片自动生成结构化巡检报告和整改建议的AI模块。',
      full_description:
        'AI巡检报告生成器在巡检完成后自动汇总所有检查项结果、扣分原因、问题照片，生成包含总评分、各维度得分、问题清单、整改建议和优先级排序的完整报告。支持一键导出PDF和推送到企业微信。基于混元大模型的自然语言生成能力构建。',
      tags: ['AI', '报告生成', '自然语言生成', '混元'],
      ai_confidence: 89,
      external_link: 'https://https://example.com/product/hunyuan',
    },
    {
      object_type_code: 'kpi',
      name: '单次巡检耗时',
      short_description: '从进店到完成报告提交的全流程耗时，衡量巡检效率。',
      full_description:
        '单次巡检耗时 = 报告提交时间 - 进店打卡时间。当前行业平均2-3小时（含报告撰写），使用智能巡检方案后目标缩短至1小时以内（报告自动生成）。效率提升50%以上。',
      tags: ['效率', '耗时', '巡检'],
      ai_confidence: 92,
      kpi_formula: '报告提交时间 - 进店打卡时间（分钟）',
    },
    {
      object_type_code: 'kpi',
      name: '整改闭环率',
      short_description: '巡检发现的问题在规定时间内完成整改的比例。',
      full_description:
        '整改闭环率 = 已闭环问题数 / 巡检发现问题总数 × 100%。目标值：7天内闭环率 ≥ 85%。低于70%的区域自动触发管理层关注。该指标直接反映巡检驱动门店改善的实际效果。',
      tags: ['整改', '闭环率', '执行效果'],
      ai_confidence: 91,
      kpi_formula: '已闭环问题数 / 巡检发现问题总数 × 100%',
    },
  ],
  relations: [
    { from_name: '门店巡检 Copilot', to_name: '区域督导', relation_type: 'serves_for', remark: '服务于区域督导' },
    { from_name: '门店巡检 Copilot', to_name: '纸质巡检效率低且数据难沉淀', relation_type: 'solves', remark: '解决纸质巡检效率问题' },
    { from_name: '门店巡检 Copilot', to_name: '巡检标准不统一导致评分主观', relation_type: 'solves', remark: '解决评分一致性问题' },
    { from_name: '门店巡检 Copilot', to_name: '智能巡检表单引擎', relation_type: 'depends_on', remark: '依赖表单引擎' },
    { from_name: '门店巡检 Copilot', to_name: 'AI 巡检报告生成器', relation_type: 'depends_on', remark: '依赖AI报告' },
    { from_name: '单次巡检耗时', to_name: '门店巡检 Copilot', relation_type: 'measured_by', remark: '衡量巡检效率' },
    { from_name: '整改闭环率', to_name: '门店巡检 Copilot', relation_type: 'measured_by', remark: '衡量整改效果' },
  ],
};

// ============================================================
// 模板 3：门店数字化运营
// ============================================================
const operationTemplate: RetailTemplate = {
  id: 'store_operation',
  name: '门店数字化运营看板',
  emoji: '🏪',
  color: '#059669',
  bgGradient: 'from-emerald-500 to-teal-600',
  subtitle: '一屏掌控门店运营全局数据',
  description:
    '为店长和区域经理提供门店运营的数字化驾驶舱，将分散的销售、库存、客流、人效等数据整合到统一看板，支持AI异常预警和智能建议。适用于需要提升门店精细化运营能力的零售企业。',
  targetUsers: ['门店店长', '区域经理', '运营总监'],
  applicableIndustry: '连锁零售 / 商超 / 便利店 / 专卖店',
  estimatedTime: '< 1 分钟完成入库',
  objects: [
    {
      object_type_code: 'scenario',
      name: '店长日报智能看板',
      short_description: '为店长提供每日运营核心数据一屏总览，含AI异常预警和行动建议。',
      full_description:
        '店长日报智能看板整合门店POS销售数据、客流统计、库存状态、人员排班等多源数据，每日早晨自动推送到店长企业微信。看板包含：今日/昨日/本周销售对比、客单价和客流转化率趋势、库存预警（滞销/缺货）、人效排名、待办任务提醒。AI模块自动识别异常指标（如某品类销量骤降）并给出可能原因和建议操作。',
      tags: ['看板', '日报', '数据驱动', '智能运营', '企业微信'],
      ai_confidence: 91,
    },
    {
      object_type_code: 'persona',
      name: '区域运营经理',
      short_description: '负责多家门店运营指标达成和资源调配的中层管理角色。',
      full_description:
        '区域运营经理通常管理一个城市或区域的15-50家门店。核心职责是确保区域整体销售目标达成、协调门店间资源调配（人员调动、库存调拨）、识别落后门店并针对性辅导、向总部汇报区域运营数据。核心诉求是"一屏看清区域全貌，快速定位问题门店，数据驱动决策"。',
      tags: ['区域管理', '运营', '决策者'],
      ai_confidence: 93,
    },
    {
      object_type_code: 'pain_point',
      name: '运营数据分散在多个系统中',
      short_description: '销售数据在POS、库存在ERP、客流在独立计数器、人效在HR系统，店长需要打开4-5个系统才能了解全貌。',
      full_description:
        '典型连锁零售企业的运营数据分散在POS系统（销售）、ERP（库存/采购）、客流计数器、HR系统（排班/考勤）、CRM（会员）等5+个独立系统中。店长每天花费30-60分钟在各系统间切换查看数据，且无法进行跨系统的关联分析（如客流高但转化低的原因）。数据时效性也参差不齐，部分数据有T+1延迟。',
      tags: ['数据孤岛', '系统割裂', '效率低', '时效性差'],
      ai_confidence: 90,
    },
    {
      object_type_code: 'pain_point',
      name: '缺乏异常预警和行动建议',
      short_description: '运营数据只有"展示"没有"洞察"，店长看到数据异常不知道该采取什么行动。',
      full_description:
        '现有BI看板通常只展示数据图表，缺乏智能分析能力。当某品类销量下降15%时，店长无法快速判断是陈列问题、缺货问题还是竞品促销影响。需要AI层进行异常检测、根因分析和行动建议推荐。',
      tags: ['缺乏洞察', '被动响应', '分析能力弱'],
      ai_confidence: 87,
    },
    {
      object_type_code: 'capability',
      name: '多源数据整合看板',
      short_description: '将POS、ERP、客流、HR等多个系统数据实时整合到统一看板的数据中台能力。',
      full_description:
        '多源数据整合看板基于云服务BI构建，通过数据连接器对接POS、ERP、客流计数器等多源系统，实现数据的T+0准实时同步。支持：可拖拽式看板配置、按角色差异化展示（店长/区域经理/总监看到不同粒度）、移动端自适应、定时推送到企业微信。',
      tags: ['数据中台', 'BI', '看板', '云服务BI'],
      ai_confidence: 90,
      external_link: 'https://https://example.com/product/bi',
    },
    {
      object_type_code: 'capability',
      name: 'AI 运营异常预警',
      short_description: '基于机器学习模型自动检测运营指标异常并推送预警和建议的智能模块。',
      full_description:
        'AI运营异常预警模块基于历史数据建立各门店的"正常运营基线"，当实时数据偏离基线超过阈值时自动触发预警。支持：销售异常检测（品类/时段/门店维度）、库存风险预警（缺货/滞销）、客流转化率异常、人效偏低等多维度预警。每个预警附带AI生成的可能原因分析和建议行动方案。',
      tags: ['AI', '异常检测', '预警', '智能分析'],
      ai_confidence: 88,
      external_link: 'https://https://example.com/product/hunyuan',
    },
    {
      object_type_code: 'kpi',
      name: '坪效（每平米日销售额）',
      short_description: '衡量门店单位面积产出效率的核心零售指标。',
      full_description:
        '坪效 = 门店日销售额 / 门店营业面积（㎡）。是零售行业最核心的效率指标之一。连锁便利店行业基准：50-80元/㎡/天，商超行业基准：30-50元/㎡/天。坪效低于行业基准70%的门店需要重点关注。',
      tags: ['效率', '坪效', '核心指标'],
      ai_confidence: 95,
      kpi_formula: '门店日销售额 / 门店营业面积（㎡）',
    },
    {
      object_type_code: 'kpi',
      name: '客流转化率',
      short_description: '进店客流中产生消费行为的比例，衡量门店吸引力和服务能力。',
      full_description:
        '客流转化率 = 成交笔数 / 进店客流数 × 100%。行业基准：便利店30-50%，商超20-35%，专卖店15-25%。该指标低于基准说明客流引入有效但转化环节存在问题（如陈列、导购、价格等）。',
      tags: ['转化率', '客流', '消费行为'],
      ai_confidence: 94,
      kpi_formula: '成交笔数 / 进店客流数 × 100%',
    },
  ],
  relations: [
    { from_name: '店长日报智能看板', to_name: '区域运营经理', relation_type: 'serves_for', remark: '服务于区域运营经理' },
    { from_name: '店长日报智能看板', to_name: '运营数据分散在多个系统中', relation_type: 'solves', remark: '解决数据分散问题' },
    { from_name: '店长日报智能看板', to_name: '缺乏异常预警和行动建议', relation_type: 'solves', remark: '解决缺乏洞察问题' },
    { from_name: '店长日报智能看板', to_name: '多源数据整合看板', relation_type: 'depends_on', remark: '依赖数据整合能力' },
    { from_name: '店长日报智能看板', to_name: 'AI 运营异常预警', relation_type: 'depends_on', remark: '依赖AI预警' },
    { from_name: '坪效（每平米日销售额）', to_name: '店长日报智能看板', relation_type: 'measured_by', remark: '衡量门店产出效率' },
    { from_name: '客流转化率', to_name: '店长日报智能看板', relation_type: 'measured_by', remark: '衡量客流转化能力' },
  ],
};

// ============================================================
// 模板 4：门店SOP智能问答助手
// ============================================================
const sopTemplate: RetailTemplate = {
  id: 'sop_assistant',
  name: '门店 SOP 智能问答助手',
  emoji: '📚',
  color: '#7c3aed',
  bgGradient: 'from-violet-500 to-purple-600',
  subtitle: '让每个店员都有专家级 SOP 知识',
  description:
    '基于企业 SOP 文档和最佳实践知识库构建的 AI 问答助手，帮助门店员工随时获取标准操作流程、应急处理方案和产品知识。大幅缩短新员工培训周期，减少操作失误。',
  targetUsers: ['培训部门', '运营部门', '门店店长', 'IT部门'],
  applicableIndustry: '连锁零售 / 餐饮 / 服务业',
  estimatedTime: '< 1 分钟完成入库',
  objects: [
    {
      object_type_code: 'scenario',
      name: 'SOP 智能问答 Copilot',
      short_description: '基于企业SOP知识库的AI问答助手，让门店员工随时查询标准操作流程。',
      full_description:
        'SOP智能问答Copilot将企业积累的SOP文档、培训材料、FAQ、最佳实践等知识结构化后，构建成RAG（检索增强生成）知识库。门店员工通过企业微信或移动端随时以自然语言提问，AI助手基于知识库生成精准回答并附上原文出处。支持场景：收银操作流程、退换货处理、投诉应对话术、设备故障排查、商品陈列标准、食品安全规范等。',
      tags: ['SOP', 'AI问答', 'RAG', '知识库', '企业微信'],
      ai_confidence: 92,
    },
    {
      object_type_code: 'persona',
      name: '新入职店员',
      short_description: '入职3个月内的门店一线员工，需要频繁查阅SOP和操作规范。',
      full_description:
        '新入职店员通常需要2-4周的集中培训和2-3个月的在岗辅导才能独立胜任工作。培训期间需要记忆大量SOP流程（收银、理货、客服、安全等），实际工作中经常遇到不确定如何操作的情况。核心诉求是"能像问师傅一样随时得到标准答案，而不是翻厚厚的操作手册"。',
      tags: ['新人', '一线员工', '培训'],
      ai_confidence: 91,
    },
    {
      object_type_code: 'pain_point',
      name: '新员工培训周期长且效果不稳定',
      short_description: '新员工需要2-4周集中培训+2-3个月在岗辅导，培训效果因带教师傅水平而参差不齐。',
      full_description:
        '连锁零售行业员工流动率高（年化30-50%），每年大量新员工入职带来持续的培训压力。传统培训依赖"老带新"模式，但资深员工精力有限且带教水平参差不齐。新员工上岗后遇到问题常常靠"问同事"或"凭记忆"，导致操作失误率高。培训部门每年投入大量资源但效果难以量化。',
      tags: ['培训成本', '员工流动', '效果不稳定'],
      ai_confidence: 89,
    },
    {
      object_type_code: 'pain_point',
      name: 'SOP文档更新滞后且查找困难',
      short_description: '纸质/PDF格式的SOP手册更新不及时，员工难以在需要时快速找到对应流程。',
      full_description:
        '企业SOP文档通常以Word/PDF形式存放在共享盘或打印成册放在门店。更新频率低（季度甚至年度更新），且新版发布后旧版回收困难。员工在实际工作中遇到问题时，翻阅200+页的操作手册效率极低，通常选择"问同事"或"凭感觉"处理。',
      tags: ['文档管理', '查找困难', '更新滞后'],
      ai_confidence: 87,
    },
    {
      object_type_code: 'capability',
      name: 'RAG 知识检索引擎',
      short_description: '基于向量检索的知识库引擎，支持自然语言问答并精准定位知识来源。',
      full_description:
        'RAG知识检索引擎将企业SOP文档（Word/PDF/PPT）自动拆分为知识片段，向量化后存入向量数据库。用户提问时，引擎先检索最相关的知识片段，再结合大模型生成自然语言回答并标注出处。支持：多文档格式解析、增量更新、权限控制、引用溯源、反馈学习。基于云服务向量数据库和混元大模型构建。',
      tags: ['RAG', '向量检索', '知识库', '大模型'],
      ai_confidence: 90,
      external_link: 'https://https://example.com/product/hunyuan',
    },
    {
      object_type_code: 'capability',
      name: '企业微信集成机器人',
      short_description: '在企业微信中嵌入AI问答机器人，员工无需安装额外App即可随时提问。',
      full_description:
        '企业微信集成机器人基于企业微信开放API构建，支持个人对话和群聊两种模式。员工在企微中@机器人即可提问，支持文字和语音输入。机器人在3秒内返回答案，并附带SOP原文链接和操作步骤截图。管理后台可查看高频问题统计、未回答问题清单和满意度反馈。',
      tags: ['企业微信', '机器人', '即时通讯', '集成'],
      ai_confidence: 89,
      external_link: 'https://https://example.com/product/qidian',
    },
    {
      object_type_code: 'data_asset',
      name: '门店SOP问答语料库',
      short_description: '结构化的门店标准操作流程知识库，作为AI问答助手的核心知识源。',
      full_description:
        '门店SOP问答语料库包含：收银操作SOP（30+流程）、退换货处理规范（15+场景）、客诉应对话术（20+类型）、设备故障排查手册（50+故障码）、食品安全操作规范、陈列标准图集等。总计500+知识条目，每条包含流程步骤、注意事项、常见错误和参考图片。需要定期更新维护。',
      tags: ['SOP', '知识库', '语料', '培训材料'],
      ai_confidence: 88,
    },
    {
      object_type_code: 'kpi',
      name: '新员工独立上岗时间',
      short_description: '从入职到能够独立完成所有岗位职责所需的天数。',
      full_description:
        '新员工独立上岗时间 = 通过岗位技能考核的日期 - 入职日期。使用SOP智能助手前平均60-90天，目标缩短至30-45天。考核标准：能独立处理90%以上的日常操作场景且无重大失误。',
      tags: ['培训效率', '上岗时间', '新人'],
      ai_confidence: 91,
      kpi_formula: '通过岗位技能考核日期 - 入职日期（天）',
    },
    {
      object_type_code: 'kpi',
      name: '知识库问答满意度',
      short_description: '员工对AI助手回答质量的满意评分。',
      full_description:
        '知识库问答满意度 = 用户评价"有帮助"的回答数 / 总回答数 × 100%。目标值：≥ 85%。低于75%时需要排查知识库覆盖率和回答质量。辅助指标：回答准确率、无法回答率、平均响应时间。',
      tags: ['满意度', '质量', '用户反馈'],
      ai_confidence: 90,
      kpi_formula: '用户评价"有帮助"的回答数 / 总回答数 × 100%',
    },
  ],
  relations: [
    { from_name: 'SOP 智能问答 Copilot', to_name: '新入职店员', relation_type: 'serves_for', remark: '主要服务于新员工' },
    { from_name: 'SOP 智能问答 Copilot', to_name: '新员工培训周期长且效果不稳定', relation_type: 'solves', remark: '解决培训效率问题' },
    { from_name: 'SOP 智能问答 Copilot', to_name: 'SOP文档更新滞后且查找困难', relation_type: 'solves', remark: '解决文档查找问题' },
    { from_name: 'SOP 智能问答 Copilot', to_name: 'RAG 知识检索引擎', relation_type: 'depends_on', remark: '依赖RAG引擎' },
    { from_name: 'SOP 智能问答 Copilot', to_name: '企业微信集成机器人', relation_type: 'depends_on', remark: '依赖企微集成' },
    { from_name: 'SOP 智能问答 Copilot', to_name: '门店SOP问答语料库', relation_type: 'depends_on', remark: '依赖知识语料' },
    { from_name: '新员工独立上岗时间', to_name: 'SOP 智能问答 Copilot', relation_type: 'measured_by', remark: '衡量培训缩短' },
    { from_name: '知识库问答满意度', to_name: 'SOP 智能问答 Copilot', relation_type: 'measured_by', remark: '衡量答案质量' },
  ],
};

// ============================================================
// 导出所有模板
// ============================================================
export const RETAIL_TEMPLATES: RetailTemplate[] = [
  promoTemplate,
  inspectionTemplate,
  operationTemplate,
  sopTemplate,
];
