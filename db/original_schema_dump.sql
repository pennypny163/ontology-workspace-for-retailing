
-- DMC dump 1.0.0
-- ------------------------------------------------------
    
-- ----------------------------
-- Table structure for asset_type_property_schema
-- ----------------------------
    
CREATE TABLE `asset_type_property_schema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `object_type_code` varchar(50) NOT NULL COMMENT '资产类型code',
  `property_key` varchar(100) NOT NULL COMMENT '属性键',
  `property_name` varchar(200) DEFAULT NULL COMMENT '属性中文名',
  `property_type` varchar(50) DEFAULT 'text' COMMENT '属性值类型 text/number/boolean/date/url/json',
  `is_required` tinyint(1) DEFAULT '0' COMMENT '是否必填',
  `is_filterable` tinyint(1) DEFAULT '0' COMMENT '是否可用于筛选',
  `is_displayable` tinyint(1) DEFAULT '1' COMMENT '是否在详情展示',
  `default_value` text COMMENT '默认值',
  `display_order` int DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_prop` (`object_type_code`,`property_key`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='资产类型属性Schema定义表';
      

-- ----------------------------
-- Table structure for asset_types
-- ----------------------------
    
CREATE TABLE `asset_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '英文唯一编码',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '中文名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '类型说明',
  `icon_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '前端图标标识',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '主题色',
  `display_order` int DEFAULT '0' COMMENT '排序',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产类型表';
      

-- ----------------------------
-- Table structure for object_properties
-- ----------------------------
    
CREATE TABLE `object_properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `object_id` int NOT NULL COMMENT '关联ontology_objects.id',
  `property_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '属性键',
  `property_value` text COLLATE utf8mb4_unicode_ci COMMENT '属性值',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_object_id` (`object_id`),
  KEY `idx_property_key` (`property_key`),
  CONSTRAINT `object_properties_ibfk_1` FOREIGN KEY (`object_id`) REFERENCES `ontology_objects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对象扩展属性表';
      

-- ----------------------------
-- Table structure for ontology_objects
-- ----------------------------
    
CREATE TABLE `ontology_objects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `object_type_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联asset_types.code',
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产名称',
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列表页短描述',
  `full_description` text COLLATE utf8mb4_unicode_ci COMMENT '详情页完整描述',
  `status` enum('draft','reviewed','published') COLLATE utf8mb4_unicode_ci DEFAULT 'draft' COMMENT '发布状态',
  `ai_confidence` decimal(5,2) DEFAULT NULL COMMENT 'AI置信度 0~100',
  `tags_json` json DEFAULT NULL COMMENT '标签数组',
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '软删除',
  `attachment_filename` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '附件原始文件名',
  `attachment_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '附件存储路径',
  `attachment_size` int DEFAULT NULL COMMENT '附件大小(字节)',
  `external_link` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '外部链接（如产品能力介绍页URL）',
  `kpi_formula` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'KPI计算公式（可选）',
  PRIMARY KEY (`id`),
  KEY `idx_type_code` (`object_type_code`),
  KEY `idx_status` (`status`),
  KEY `idx_name` (`name`),
  CONSTRAINT `ontology_objects_ibfk_1` FOREIGN KEY (`object_type_code`) REFERENCES `asset_types` (`code`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产对象表(本体节点)';
      

-- ----------------------------
-- Table structure for ontology_relations
-- ----------------------------
    
CREATE TABLE `ontology_relations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_object_id` int NOT NULL COMMENT '源对象ID',
  `relation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关系类型',
  `to_object_id` int NOT NULL COMMENT '目标对象ID',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `display_order` int DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '关系状态 active/inactive/pending',
  `ai_confidence` decimal(5,2) DEFAULT NULL COMMENT 'AI置信度 0~100',
  `weight` decimal(5,2) DEFAULT '1.00' COMMENT '关系权重 0~10',
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '软删除',
  PRIMARY KEY (`id`),
  KEY `idx_from` (`from_object_id`),
  KEY `idx_to` (`to_object_id`),
  KEY `idx_relation_type` (`relation_type`),
  CONSTRAINT `ontology_relations_ibfk_1` FOREIGN KEY (`from_object_id`) REFERENCES `ontology_objects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ontology_relations_ibfk_2` FOREIGN KEY (`to_object_id`) REFERENCES `ontology_objects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对象关系表(本体边)';
      

-- ----------------------------
-- Table structure for relation_schema_rules
-- ----------------------------
    
CREATE TABLE `relation_schema_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source_type_code` varchar(50) NOT NULL COMMENT '源类型code',
  `relation_type_code` varchar(50) NOT NULL COMMENT '关系类型code',
  `target_type_code` varchar(50) NOT NULL COMMENT '目标类型code',
  `is_allowed` tinyint(1) DEFAULT '1' COMMENT '是否允许',
  `validation_level` varchar(20) DEFAULT 'warning' COMMENT '校验级别 warning/blocking',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_schema_rule` (`source_type_code`,`relation_type_code`,`target_type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='关系模式约束规则表';
      

-- ----------------------------
-- Table structure for relation_types
-- ----------------------------
    
CREATE TABLE `relation_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '关系类型编码',
  `name_zh` varchar(100) NOT NULL COMMENT '中文名称',
  `name_en` varchar(100) DEFAULT NULL COMMENT '英文名称',
  `reverse_name_zh` varchar(100) DEFAULT NULL COMMENT '反向中文名称',
  `description` text COMMENT '描述',
  `is_directed` tinyint(1) DEFAULT '1' COMMENT '是否有向',
  `color` varchar(20) DEFAULT '#6366f1' COMMENT '连线颜色',
  `line_style` varchar(20) DEFAULT 'solid' COMMENT '线型 solid/dashed/dotted',
  `display_order` int DEFAULT '0' COMMENT '排序',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='关系类型配置表';
      
