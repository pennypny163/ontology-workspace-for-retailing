import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, Loader, Bot, User, RotateCcw, CheckCircle,
  AlertCircle, Tag, Link2, Trash2, ChevronDown, ChevronUp,
  MessageSquare, ArrowRight
} from 'lucide-react';
import {
  nlChat, confirmSaveAssets,
  NLChatMessage, NLChatResponse,
  ExtractedObject, ExtractedRelation
} from '../services/api';

const MAX_ROUNDS = 3;

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

const RELATION_CN: Record<string, string> = {
  serves_for: '服务于', solves: '解决', depends_on: '依赖',
  measured_by: '由…衡量', related_to: '相关', belongs_to: '属于',
  validated_by: '被…验证',
};

// 预设的快速输入建议
const QUICK_SUGGESTIONS = [
  '我们想为连锁零售门店搭建一个促销执行助手，帮助店长跟踪促销任务完成情况',
  '需要一个门店巡检的解决方案，自动化巡检流程并生成合规报告',
  '面向连锁便利店的会员精准营销方案，基于客户画像推荐商品',
];

/** 聊天气泡中的消息项 */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const NLChatPanel: React.FC = () => {
  // 对话状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<NLChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [roundIndex, setRoundIndex] = useState(1);
  const [isThinking, setIsThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // 提取结果
  const [extraction, setExtraction] = useState<NLChatResponse['extraction']>(null);
  const [editedObjects, setEditedObjects] = useState<ExtractedObject[]>([]);
  const [editedRelations, setEditedRelations] = useState<ExtractedRelation[]>([]);
  const [expandedObjIdx, setExpandedObjIdx] = useState<number | null>(null);

  // 入库状态
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 对话完成标志
  const [chatFinished, setChatFinished] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking]);

  // 获取当前时间戳
  const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // 发送消息
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || isThinking || chatFinished) return;

    setChatError(null);
    setInputValue('');

    // 添加用户消息到聊天列表
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: getNow() };
    setChatMessages(prev => [...prev, userMsg]);

    // 构建 API 消息
    const newApiMessages: NLChatMessage[] = [...apiMessages, { role: 'user', content: text }];
    setApiMessages(newApiMessages);

    setIsThinking(true);

    try {
      const response = await nlChat({
        messages: newApiMessages,
        round_index: roundIndex,
      });

      // 添加 AI 回复
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: getNow(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      setApiMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);

      if (response.is_final && response.extraction) {
        // 最终轮，展示结构化结果
        setExtraction(response.extraction);
        setEditedObjects(response.extraction.objects || []);
        setEditedRelations(response.extraction.relations || []);
        setChatFinished(true);

        // 添加系统提示消息
        setChatMessages(prev => [...prev, {
          role: 'system',
          content: `✅ 已完成 ${MAX_ROUNDS} 轮对话，AI 已生成结构化资产。请在下方查看和编辑提取结果。`,
          timestamp: getNow(),
        }]);
      } else {
        setRoundIndex(prev => prev + 1);
        // 如果还没到最终轮，添加轮次提示
        const remaining = MAX_ROUNDS - roundIndex;
        if (remaining > 0) {
          setChatMessages(prev => [...prev, {
            role: 'system',
            content: `第 ${roundIndex}/${MAX_ROUNDS} 轮对话完成，还剩 ${remaining} 轮追问。${remaining === 1 ? '下一轮将生成最终结构化结果。' : ''}`,
            timestamp: getNow(),
          }]);
        }
      }
    } catch (err: any) {
      setChatError(err.message || '对话失败，请重试');
    } finally {
      setIsThinking(false);
      // 聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isThinking, chatFinished, apiMessages, roundIndex]);

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 删除对象
  const removeObject = useCallback((idx: number) => {
    const removedName = editedObjects[idx]?.name;
    setEditedObjects(prev => prev.filter((_, i) => i !== idx));
    setEditedRelations(prev => prev.filter(
      r => r.from_name !== removedName && r.to_name !== removedName
    ));
    if (expandedObjIdx === idx) setExpandedObjIdx(null);
  }, [editedObjects, expandedObjIdx]);

  // 删除关系
  const removeRelation = useCallback((idx: number) => {
    setEditedRelations(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // 确认入库
  const handleConfirmSave = useCallback(async () => {
    if (editedObjects.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const resp = await confirmSaveAssets({
        objects: editedObjects,
        relations: editedRelations,
        created_by: '自然语言对话',
      });
      setSaveSuccess(resp.message);
      setTimeout(() => {
        setExtraction(null);
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

  // 重置全部
  const handleResetAll = useCallback(() => {
    setChatMessages([]);
    setApiMessages([]);
    setInputValue('');
    setRoundIndex(1);
    setIsThinking(false);
    setChatError(null);
    setExtraction(null);
    setEditedObjects([]);
    setEditedRelations([]);
    setExpandedObjIdx(null);
    setSaving(false);
    setSaveSuccess(null);
    setSaveError(null);
    setChatFinished(false);
  }, []);

  const isEmptyChat = chatMessages.length === 0;

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* 空状态 - 引导 */}
        {isEmptyChat && (
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">用自然语言描述你的方案</h3>
            <p className="text-sm text-gray-500 mb-1">
              AI 助手将通过 <span className="font-semibold text-violet-600">{MAX_ROUNDS} 轮对话</span> 逐步了解方案细节，最终自动生成结构化资产。
            </p>
            <p className="text-xs text-gray-400 mb-5">无需填写复杂表单，像聊天一样轻松创建资产。</p>

            {/* 轮次进度指示 */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map(r => (
                <React.Fragment key={r}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      r < MAX_ROUNDS ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {r < MAX_ROUNDS ? r : '✓'}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {r < MAX_ROUNDS ? `第${r}轮追问` : '生成资产'}
                    </span>
                  </div>
                  {r < 3 && <ArrowRight size={14} className="text-gray-300 mb-4" />}
                </React.Fragment>
              ))}
            </div>

            {/* 快速建议 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">试试这些场景 ↓</p>
              {QUICK_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(suggestion);
                    setTimeout(() => handleSend(suggestion), 50);
                  }}
                  className="w-full text-left bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 rounded-xl px-4 py-3 text-sm text-gray-700 hover:text-violet-700 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-gray-400 group-hover:text-violet-500 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 聊天消息列表 */}
        {!isEmptyChat && (
          <div className="mb-4">
            {/* 轮次进度条 */}
            <div className="flex items-center gap-2 mb-4 px-2">
              {[1, 2, 3].map(r => (
                <React.Fragment key={r}>
                  <div className={`flex items-center gap-1.5 ${r <= roundIndex - 1 ? '' : r === roundIndex && !chatFinished ? '' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      r < roundIndex || chatFinished
                        ? 'bg-emerald-500 text-white'
                        : r === roundIndex && !chatFinished
                        ? 'bg-violet-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {r < roundIndex || chatFinished ? '✓' : r}
                    </div>
                    <span className={`text-[10px] font-medium ${
                      r < roundIndex || chatFinished ? 'text-emerald-600' :
                      r === roundIndex && !chatFinished ? 'text-violet-600' : 'text-gray-400'
                    }`}>
                      {r < MAX_ROUNDS ? `第${r}轮` : '生成'}
                    </span>
                  </div>
                  {r < 3 && <div className={`flex-1 h-0.5 rounded-full ${
                    r < roundIndex || chatFinished ? 'bg-emerald-300' : 'bg-gray-200'
                  }`} />}
                </React.Fragment>
              ))}
            </div>

            {/* 消息区域 */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}
                  {msg.role === 'system' && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5'
                      : msg.role === 'system'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl rounded-tl-md px-4 py-2.5'
                      : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-md px-4 py-2.5'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-violet-200' : 'text-gray-400'
                    }`}>{msg.timestamp}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {/* AI 思考中 */}
              {isThinking && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader size={14} className="text-violet-500 animate-spin" />
                      <span className="text-sm text-gray-500">
                        {roundIndex >= MAX_ROUNDS ? 'AI 正在生成结构化资产...' : 'AI 正在思考追问...'}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map(j => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
                          style={{ animationDelay: `${j * 0.3}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* 错误提示 */}
            {chatError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-800">对话出错</p>
                  <p className="text-xs text-red-600 mt-0.5">{chatError}</p>
                </div>
                <button onClick={() => setChatError(null)} className="text-red-400 hover:text-red-600">
                  <Sparkles size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 输入区域 */}
        {!chatFinished && (
          <div className="relative">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isThinking}
                  placeholder={isEmptyChat ? '描述你的零售解决方案，例如：我想为连锁超市搭建一个智能补货方案...' : '输入你的回答...'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isThinking}
                  className={`absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    inputValue.trim() && !isThinking
                      ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] text-gray-400">
                按 Enter 发送，Shift+Enter 换行
              </p>
              {!isEmptyChat && (
                <button
                  onClick={handleResetAll}
                  className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={10} />
                  重新开始
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========== 结构化提取结果 ========== */}
        {chatFinished && extraction && (
          <div className="mt-4 border-t border-gray-200 pt-5">
            {/* 概要 */}
            {extraction.summary && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">AI 方案总结</span>
                </div>
                <p className="text-sm text-violet-800">{extraction.summary}</p>
              </div>
            )}

            {/* 提取的资产对象 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag size={14} className="text-violet-500" />
                提取的资产对象（{editedObjects.length}）
                <span className="text-[10px] text-gray-400 font-normal">— 点击展开详情，可删除不需要的对象</span>
              </h4>
              <div className="space-y-2">
                {editedObjects.map((obj, idx) => {
                  const color = TYPE_COLOR[obj.object_type_code] || '#4f46e5';
                  const isExpanded = expandedObjIdx === idx;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:border-violet-200 transition-colors">
                      <div className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => setExpandedObjIdx(isExpanded ? null : idx)}>
                        <span className="text-[10px] uppercase font-bold rounded px-2 py-0.5 flex-shrink-0"
                          style={{ backgroundColor: color + '15', color }}>
                          {TYPE_CN[obj.object_type_code] || obj.object_type_code}
                        </span>
                        <span className="text-sm font-medium text-gray-900 flex-1 truncate">{obj.name}</span>
                        {obj.ai_confidence != null && (
                          <span className="text-[10px] text-violet-600 font-bold bg-violet-50 rounded-full px-2 py-0.5">
                            {Math.round(obj.ai_confidence)}%
                          </span>
                        )}
                        <button onClick={e => { e.stopPropagation(); removeObject(idx); }}
                          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title="删除此对象">
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
                          {obj.tags && obj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {obj.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-violet-50 text-violet-600 rounded px-1.5 py-0.5">{tag}</span>
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

            {/* 关系列表 */}
            {editedRelations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Link2 size={14} className="text-violet-500" />
                  提取的关系（{editedRelations.length}）
                </h4>
                <div className="space-y-1.5">
                  {editedRelations.map((rel, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                      <span className="text-xs font-medium text-gray-800 truncate">{rel.from_name}</span>
                      <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 rounded px-1.5 py-0.5 flex-shrink-0">
                        {RELATION_CN[rel.relation_type] || rel.relation_type}
                      </span>
                      <span className="text-xs font-medium text-gray-800 truncate">{rel.to_name}</span>
                      <button onClick={() => removeRelation(idx)}
                        className="ml-auto text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button onClick={handleConfirmSave}
                disabled={saving || editedObjects.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${
                  saving || editedObjects.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg'
                }`}>
                {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {saving ? '正在保存...' : `确认入库（${editedObjects.length} 个对象）`}
              </button>
              <button onClick={handleResetAll}
                className="px-4 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <RotateCcw size={14} />
                重新开始新对话
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
    </div>
  );
};

export default NLChatPanel;
