/**
 * 零售解决方案本体工作台 - API 服务层
 * 所有后端接口调用集中管理
 */

// ============================================================
// 类型定义
// ============================================================

/** 资产类型卡片（总览页） */
export interface AssetTypeSummary {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  color: string | null;
  display_order: number;
  record_count: number;
  sample_items: string[];
}

/** 资产列表项 */
export interface ObjectListItem {
  id: number;
  object_type_code: string;
  name: string;
  short_description: string | null;
  status: 'draft' | 'reviewed' | 'published';
  ai_confidence: number | null;
  tags: string[];
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** 分页资产列表 */
export interface PaginatedObjects {
  items: ObjectListItem[];
  total: number;
  page: number;
  page_size: number;
}

/** 关联资产项 */
export interface RelationItem {
  relation_type: string;
  relation_label_cn: string;
  related_object_id: number;
  related_object_type: string;
  related_object_type_name: string;
  related_object_name: string;
}

/** 资产详情（抽屉） */
export interface ObjectDetail {
  id: number;
  object_type_code: string;
  object_type_name: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  status: 'draft' | 'reviewed' | 'published';
  ai_confidence: number | null;
  tags: string[];
  attachment_filename: string | null;
  attachment_path: string | null;
  attachment_size: number | null;
  external_link: string | null;
  kpi_formula: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  relations: RelationItem[];
}

/** 资产总览统计 */
export interface AssetSummary {
  total_types: number;
  total_objects: number;
  published_count: number;
  reviewed_count: number;
  draft_count: number;
}

// ============================================================
// API 基础配置
// ============================================================

const API_BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ============================================================
// API 方法
// ============================================================

/** 获取所有资产类型（总览页卡片） */
export async function fetchAssetTypes(): Promise<AssetTypeSummary[]> {
  return fetchJSON<AssetTypeSummary[]>(`${API_BASE}/asset-types`);
}

/** 获取某个类型下的资产列表 */
export async function fetchObjectsByType(
  typeCode: string,
  keyword: string = '',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedObjects> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    page_size: String(pageSize),
  });
  return fetchJSON<PaginatedObjects>(`${API_BASE}/asset-types/${typeCode}/objects?${params}`);
}

/** 获取单个资产详情 */
export async function fetchObjectDetail(objectId: number): Promise<ObjectDetail> {
  return fetchJSON<ObjectDetail>(`${API_BASE}/objects/${objectId}`);
}

/** 获取资产总览统计 */
export async function fetchAssetSummary(): Promise<AssetSummary> {
  return fetchJSON<AssetSummary>(`${API_BASE}/asset-summary`);
}

// ============================================================
// 文件上传 + 大模型提取 API
// ============================================================

/** 提取出的资产对象 */
export interface ExtractedObject {
  object_type_code: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  tags: string[];
  ai_confidence: number | null;
  external_link?: string | null;
  kpi_formula?: string | null;
}

/** 提取出的关系 */
export interface ExtractedRelation {
  from_name: string;
  to_name: string;
  relation_type: string;
  remark: string | null;
}

/** 提取结果 */
export interface ExtractionResult {
  objects: ExtractedObject[];
  relations: ExtractedRelation[];
  summary: string;
  source_filename: string;
  text_preview: string;
}

/** 确认保存请求 */
export interface ConfirmSaveRequest {
  objects: ExtractedObject[];
  relations: ExtractedRelation[];
  created_by?: string;
}

/** 确认保存响应 */
export interface ConfirmSaveResponse {
  success: boolean;
  message: string;
  created_objects: { id: number; name: string; type: string }[];
  created_relations: { from: string; to: string; type: string }[];
}

/** 进度回调类型 */
export type ProgressCallback = (message: string) => void;

/** 上传文件并通过大模型提取资产（SSE 流式接收） */
export async function uploadAndExtract(file: File, onProgress?: ProgressCallback): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('file', file);

  // 设置 180 秒超时（SSE 流式连接需要更长时间）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(`${API_BASE}/upload-extract`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('文件体积超过服务器限制（最大 50MB），请压缩文件后重试');
      }
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || `上传失败: ${response.status}`);
    }

    // 读取 SSE 流
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('浏览器不支持流式读取');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let result: ExtractionResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按行解析 SSE 事件
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留不完整的最后一行

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (!dataStr || dataStr === '[DONE]') continue;

        try {
          const event = JSON.parse(dataStr);
          if (event.type === 'progress' && onProgress) {
            onProgress(event.message);
          } else if (event.type === 'error') {
            throw new Error(event.message);
          } else if (event.type === 'result') {
            result = event.data as ExtractionResult;
          }
        } catch (parseErr: any) {
          // 如果是我们自己抛出的 Error（type=error），继续向上抛
          if (parseErr.message && !parseErr.message.includes('JSON')) {
            throw parseErr;
          }
          // JSON 解析失败则忽略该行
        }
      }
    }

    if (!result) {
      throw new Error('未收到有效的提取结果');
    }
    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI 处理超时，请尝试上传更小的文件');
    }
    throw err;
  }
}

/** 确认保存提取出的资产到数据库 */
export async function confirmSaveAssets(req: ConfirmSaveRequest): Promise<ConfirmSaveResponse> {
  const response = await fetch(`${API_BASE}/confirm-save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `保存失败: ${response.status}`);
  }
  return response.json();
}

// ============================================================
// 引导表单相关 API
// ============================================================

/** 已有资产项（用于关系选择） */
export interface ExistingObjectItem {
  id: number;
  name: string;
  object_type_code: string;
  object_type_name: string;
  status: string;
}

/** 获取已有资产列表（用于建立关系） */
export async function fetchExistingObjects(
  keyword: string = '',
  typeCode: string = '',
  limit: number = 50
): Promise<ExistingObjectItem[]> {
  const params = new URLSearchParams({ keyword, type_code: typeCode, limit: String(limit) });
  return fetchJSON<ExistingObjectItem[]>(`${API_BASE}/existing-objects?${params}`);
}

/** AI 增强请求 */
export interface AIEnhanceRequest {
  object_type_code: string;
  name: string;
  short_description?: string;
  tags?: string[];
}

/** AI 增强结果 */
export interface AIEnhanceResult {
  full_description: string;
  suggested_tags: string[];
  ai_confidence: number;
}

/** AI 增强表单内容 */
export async function aiEnhanceForm(req: AIEnhanceRequest): Promise<AIEnhanceResult> {
  const response = await fetch(`${API_BASE}/ai-enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `AI增强失败: ${response.status}`);
  }
  return response.json();
}

/** 表单关系项 */
export interface FormRelation {
  target_object_id: number;
  relation_type: string;
  remark?: string;
}

/** 表单提交请求 */
export interface FormSubmitRequest {
  object_type_code: string;
  name: string;
  short_description?: string;
  full_description?: string;
  tags?: string[];
  ai_confidence?: number;
  relations?: FormRelation[];
  created_by?: string;
  attachment_filename?: string;
  attachment_path?: string;
  attachment_size?: number;
  external_link?: string;
  kpi_formula?: string;
}

/** 表单提交响应 */
export interface FormSubmitResponse {
  success: boolean;
  message: string;
  created_object: { id: number; name: string; type: string; type_name: string };
  created_relations: { from: string; to: string; type: string }[];
}

/** 附件上传响应 */
export interface AttachmentUploadResponse {
  success: boolean;
  filename: string;
  stored_path: string;
  file_size: number;
}

/** 上传附件文件 */
export async function uploadAttachment(file: File): Promise<AttachmentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/form-upload-attachment`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `附件上传失败: ${response.status}`);
  }
  return response.json();
}

/** 需要附件的资产类型 */
export const FILE_REQUIRED_TYPES = new Set(['case_asset', 'demo_asset', 'data_asset', 'playbook']);

/** 引导表单提交 */
export async function formSubmitAsset(req: FormSubmitRequest): Promise<FormSubmitResponse> {
  const response = await fetch(`${API_BASE}/form-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `提交失败: ${response.status}`);
  }
  return response.json();
}

// ============================================================
// 自然语言多轮对话 API
// ============================================================

/** 对话消息 */
export interface NLChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** 对话请求 */
export interface NLChatRequest {
  messages: NLChatMessage[];
  round_index: number;
}

/** 对话响应 */
export interface NLChatResponse {
  reply: string;
  is_final: boolean;
  extraction: {
    summary?: string;
    objects?: ExtractedObject[];
    relations?: ExtractedRelation[];
  } | null;
}

/** 自然语言多轮对话 */
export async function nlChat(req: NLChatRequest): Promise<NLChatResponse> {
  const response = await fetch(`${API_BASE}/nl-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `对话失败: ${response.status}`);
  }
  return response.json();
}

// ============================================================
// 语义层 API
// ============================================================

/** 关系类型配置 */
export interface RelationTypeConfig {
  id: number;
  code: string;
  name_zh: string;
  name_en: string;
  reverse_name_zh: string;
  description: string;
  is_directed: boolean;
  color: string;
  line_style: string;
  display_order: number;
}

/** Schema 规则 */
export interface SchemaRule {
  id: number;
  source_type_code: string;
  relation_type_code: string;
  target_type_code: string;
  validation_level: string;
  remark: string;
}

/** 属性 Schema */
export interface PropertySchema {
  id: number;
  property_key: string;
  property_name: string;
  property_type: string;
  is_required: boolean;
  is_filterable: boolean;
  is_displayable: boolean;
  default_value: string | null;
  display_order: number;
}

/** 获取所有关系类型 */
export async function fetchRelationTypes(): Promise<RelationTypeConfig[]> {
  return fetchJSON<RelationTypeConfig[]>(`${API_BASE}/semantic/relation-types`);
}

/** 获取 Schema 规则 */
export async function fetchSchemaRules(): Promise<SchemaRule[]> {
  return fetchJSON<SchemaRule[]>(`${API_BASE}/semantic/schema-rules`);
}

/** 获取资产类型属性 Schema */
export async function fetchPropertySchema(typeCode: string): Promise<PropertySchema[]> {
  return fetchJSON<PropertySchema[]>(`${API_BASE}/semantic/object-type/${typeCode}/property-schema`);
}

// ============================================================
// Graph API
// ============================================================

/** Graph 节点 */
export interface GraphNode {
  id: string;
  objectId: number;
  label: string;
  type: string;
  typeName: string;
  color: string;
  icon: string;
  status: string;
  tags: string[];
  ai_confidence: number | null;
  short_description: string | null;
}

/** Graph 边 */
export interface GraphEdge {
  id: string;
  relationId: number;
  source: string;
  target: string;
  relation_type: string;
  label: string;
  reverse_label: string;
  color: string;
  line_style: string;
  is_schema_valid: boolean;
  remark: string | null;
  weight: number;
}

/** Graph 数据 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    total_nodes: number;
    total_edges: number;
    center_object_id?: number;
    depth?: number;
    filters_applied?: Record<string, string | null>;
  };
}

/** Graph 统计 */
export interface GraphStats {
  type_stats: { code: string; name: string; color: string; count: number }[];
  status_stats: { status: string; count: number }[];
  relation_stats: { code: string; name: string; color: string; count: number }[];
  total_nodes: number;
  total_edges: number;
}

/** 关系详情 */
export interface RelationDetail {
  id: number;
  relation_type: string;
  name_zh: string;
  reverse_name_zh: string;
  color: string;
  line_style: string;
  remark: string | null;
  weight: number;
  status: string;
  ai_confidence: number | null;
  is_schema_valid: boolean;
  from_object: { id: number; name: string; type_code: string; type_name: string };
  to_object: { id: number; name: string; type_code: string; type_name: string };
  created_at: string | null;
  created_by: string | null;
}

/** 增强版对象详情（Graph 面板用） */
export interface OntologyObjectDetail {
  id: number;
  object_type_code: string;
  object_type_name: string;
  object_type_color: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  status: string;
  ai_confidence: number | null;
  tags: string[];
  attachment_filename: string | null;
  attachment_path: string | null;
  external_link: string | null;
  kpi_formula: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  properties: { key: string; value: string }[];
  forward_relations: {
    relation_id: number;
    relation_type: string;
    label: string;
    target_id: number;
    target_name: string;
    target_type: string;
    target_type_name: string;
    is_schema_valid: boolean;
  }[];
  reverse_relations: {
    relation_id: number;
    relation_type: string;
    label: string;
    source_id: number;
    source_name: string;
    source_type: string;
    source_type_name: string;
    is_schema_valid: boolean;
  }[];
}

/** 获取子图（一跳邻居） */
export async function fetchSubgraph(objectId: number, depth: number = 1): Promise<GraphData> {
  return fetchJSON<GraphData>(`${API_BASE}/graph/subgraph?object_id=${objectId}&depth=${depth}`);
}

/** 按条件筛选图谱 */
export async function fetchFilteredGraph(params: {
  object_type_code?: string;
  status?: string;
  relation_type?: string;
  tag?: string;
  keyword?: string;
  limit?: number;
}): Promise<GraphData> {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
  return fetchJSON<GraphData>(`${API_BASE}/graph/filter?${p}`);
}

/** 获取图谱总览 */
export async function fetchGraphOverview(limit: number = 80): Promise<GraphData> {
  return fetchJSON<GraphData>(`${API_BASE}/graph/overview?limit=${limit}`);
}

/** 获取图谱统计 */
export async function fetchGraphStats(): Promise<GraphStats> {
  return fetchJSON<GraphStats>(`${API_BASE}/graph/stats`);
}

/** 获取关系详情 */
export async function fetchRelationDetail(relationId: number): Promise<RelationDetail> {
  return fetchJSON<RelationDetail>(`${API_BASE}/graph/relation-detail/${relationId}`);
}

/** 获取增强版对象详情（Graph 面板用） */
export async function fetchOntologyObjectDetail(objectId: number): Promise<OntologyObjectDetail> {
  return fetchJSON<OntologyObjectDetail>(`${API_BASE}/ontology/objects/${objectId}`);
}