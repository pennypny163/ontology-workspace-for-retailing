import React, { useState, useEffect } from 'react';
import {
  Building2, ShoppingCart, Users, AlertTriangle, Cpu, Database,
  Play, Award, BookOpen, Target, BarChart3, Search, ChevronRight,
  Loader, AlertCircle
} from 'lucide-react';
import {
  fetchAssetTypes, fetchObjectsByType,
  AssetTypeSummary, ObjectListItem
} from '../services/api';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={22} />,
  ShoppingCart: <ShoppingCart size={22} />,
  Users: <Users size={22} />,
  AlertTriangle: <AlertTriangle size={22} />,
  Cpu: <Cpu size={22} />,
  Database: <Database size={22} />,
  Play: <Play size={22} />,
  Award: <Award size={22} />,
  BookOpen: <BookOpen size={22} />,
  Target: <Target size={22} />,
  BarChart3: <BarChart3 size={22} />,
};

// 状态中文标签
const statusLabels: Record<string, string> = {
  published: '已发布',
  reviewed: '已审核',
  draft: '草稿',
};

interface AssetLibraryProps {
  onAssetClick: (asset: ObjectListItem) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ onAssetClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // 类型列表状态
  const [assetTypes, setAssetTypes] = useState<AssetTypeSummary[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);

  // 资产列表状态
  const [objects, setObjects] = useState<ObjectListItem[]>([]);
  const [objectsTotal, setObjectsTotal] = useState(0);
  const [objectsLoading, setObjectsLoading] = useState(false);
  const [objectsError, setObjectsError] = useState<string | null>(null);

  // 加载资产类型
  useEffect(() => {
    setTypesLoading(true);
    setTypesError(null);
    fetchAssetTypes()
      .then(data => {
        setAssetTypes(data);
        setTypesLoading(false);
      })
      .catch(err => {
        setTypesError(err.message || '加载资产类型失败');
        setTypesLoading(false);
      });
  }, []);

  // 选中类型后加载资产列表
  useEffect(() => {
    if (!selectedType) {
      setObjects([]);
      setObjectsTotal(0);
      return;
    }
    setObjectsLoading(true);
    setObjectsError(null);
    fetchObjectsByType(selectedType, searchTerm)
      .then(data => {
        setObjects(data.items);
        setObjectsTotal(data.total);
        setObjectsLoading(false);
      })
      .catch(err => {
        setObjectsError(err.message || '加载资产列表失败');
        setObjectsLoading(false);
      });
  }, [selectedType, searchTerm]);

  // 搜索过滤（总览页按类型名称过滤）
  const filteredTypes = assetTypes.filter(ot =>
    !searchTerm || ot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTypeInfo = selectedType
    ? assetTypes.find(ot => ot.code === selectedType)
    : null;

  return (
    <section id="assets" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">资产库中存储了什么？</h2>
        <p className="text-gray-500">结构化的对象代表可复用的零售解决方案知识 —— 按类型组织，通过关系连接。数据来自真实数据库。</p>
      </div>

      {/* 搜索 */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索资产类型或记录..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
        />
      </div>

      {/* 加载状态 */}
      {typesLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="text-brand-500 animate-spin mr-3" />
          <span className="text-gray-500 text-sm">正在加载资产类型...</span>
        </div>
      )}

      {/* 错误状态 */}
      {typesError && (
        <div className="flex items-center justify-center py-20 text-red-500">
          <AlertCircle size={20} className="mr-2" />
          <span className="text-sm">{typesError}</span>
        </div>
      )}

      {/* 总览页：对象类型网格 */}
      {!typesLoading && !typesError && !selectedType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTypes.map(ot => (
            <button
              key={ot.code}
              onClick={() => setSelectedType(ot.code)}
              className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg hover:border-brand-200 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: (ot.color || '#4f46e5') + '15', color: ot.color || '#4f46e5' }}
                >
                  {iconMap[ot.icon_name || ''] || <Database size={22} />}
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                  {ot.record_count} 条记录
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-700 transition-colors">{ot.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{ot.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {ot.sample_items.slice(0, 2).map(name => (
                  <span key={name} className="text-xs bg-gray-50 text-gray-600 rounded-md px-2 py-0.5 truncate max-w-[140px]">
                    {name}
                  </span>
                ))}
                {ot.record_count > 2 && (
                  <span className="text-xs text-gray-400">+{ot.record_count - 2} 更多</span>
                )}
              </div>
            </button>
          ))}

          {/* 空状态 */}
          {filteredTypes.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-sm">未找到匹配的资产类型</p>
            </div>
          )}
        </div>
      )}

      {/* 选中类型详情页 */}
      {!typesLoading && !typesError && selectedType && selectedTypeInfo && (
        <div>
          <button
            onClick={() => { setSelectedType(null); setSearchTerm(''); }}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-4 font-medium"
          >
            ← 返回所有类型
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: (selectedTypeInfo.color || '#4f46e5') + '15', color: selectedTypeInfo.color || '#4f46e5' }}
            >
              {iconMap[selectedTypeInfo.icon_name || ''] || <Database size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{selectedTypeInfo.name}</h3>
              <p className="text-sm text-gray-500">{selectedTypeInfo.description}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1">
              共 {objectsTotal} 条记录
            </span>
          </div>

          {/* 加载状态 */}
          {objectsLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader size={20} className="text-brand-500 animate-spin mr-2" />
              <span className="text-gray-500 text-sm">正在加载资产列表...</span>
            </div>
          )}

          {/* 错误状态 */}
          {objectsError && (
            <div className="flex items-center justify-center py-16 text-red-500">
              <AlertCircle size={18} className="mr-2" />
              <span className="text-sm">{objectsError}</span>
            </div>
          )}

          {/* 资产列表 */}
          {!objectsLoading && !objectsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {objects.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => onAssetClick(asset)}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-brand-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors leading-tight">
                      {asset.name}
                    </h4>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors mt-0.5 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{asset.short_description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {asset.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-brand-50 text-brand-600 rounded-md px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      asset.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                      asset.status === 'reviewed' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {statusLabels[asset.status] || asset.status}
                    </span>
                  </div>
                </button>
              ))}

              {/* 空状态 */}
              {objects.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <p className="text-sm">暂无资产记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AssetLibrary;
