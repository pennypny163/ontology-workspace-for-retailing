-- Simple seed data for local preview

INSERT INTO asset_types (code, name, description, icon_name, color, display_order, is_active)
VALUES ('capability', '能力模块', '示例资产类型，用于本地预览', 'Sparkles', '#6366f1', 1, 1);

INSERT INTO relation_types (code, name_zh, name_en, reverse_name_zh, description, is_directed, color, line_style, is_active)
VALUES ('related_to', '关联', 'related_to', '被关联', '通用关联关系', 1, '#6366f1', 'solid', 1);

INSERT INTO ontology_objects (object_type_code, name, short_description, full_description, status, tags_json, created_by)
VALUES ('capability', '示例能力A', '这是一个示例能力A', '这是一个用于演示的示例能力对象。', 'published', '["示例","能力"]', 'system');

INSERT INTO ontology_objects (object_type_code, name, short_description, full_description, status, tags_json, created_by)
VALUES ('capability', '示例能力B', '这是一个示例能力B', '这是一个与能力A关联的示例能力对象。', 'published', '["示例","关联"]', 'system');

INSERT INTO ontology_relations (from_object_id, relation_type, to_object_id, status, created_by)
VALUES (1, 'related_to', 2, 'active', 'system');
