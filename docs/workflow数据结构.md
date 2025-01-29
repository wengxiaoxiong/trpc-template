# 工作流数据结构文档

## 核心模型概述

### 1. 工作流 (Workflow)
- **描述**: 代表一个完整的工作流配置，包含基本信息、参数配置和参数组
- **字段**:
  - `id`: 自增主键
  - `name`: 工作流名称
  - `description`: 工作流描述
  - `content`: 存储原始工作流内容的JSON
  - `isPublic`: 是否公开
  - `ownerId`: 所属用户ID
  - `parameters`: 工作流参数列表
  - `paramGroups`: 参数组列表

**示例**:
```json
{
  "id": 1,
  "name": "图像生成工作流",
  "description": "用于生成高质量图像的AI工作流",
  "content": {
    "nodes": [
      {"id": "1", "type": "image_generator"},
      {"id": "2", "type": "image_processor"}
    ]
  },
  "isPublic": false,
  "ownerId": 123,
  "parameters": [...],
  "paramGroups": [...]
}
```

### 2. 工作流参数 (WorkflowParameter)
- **描述**: 工作流中单个参数的配置
- **字段**:
  - `name`: 参数名称
  - `type`: 参数类型 (string, number, boolean等)
  - `default`: 默认值 (JSON字符串)
  - `nodeId`: 所属节点ID
  - `paramKey`: 参数键名

**示例**:
```json
{
  "id": 1,
  "name": "image_size",
  "type": "number",
  "default": "512",
  "nodeId": "image_generator_1",
  "paramKey": "size",
  "workflowId": 1
}
```

### 3. 参数组 (WorkflowParamGroup)
- **描述**: 用于批量配置参数的组，通常用于XYZ轴配置
- **字段**:
  - `name`: 组名 (如X轴、Y轴、Z轴)
  - `params`: 组内参数项
  - `combinations`: 参数组合

**示例**:
```json
{
  "id": 1,
  "name": "X轴",
  "workflowId": 1,
  "params": [
    {
      "nodeId": "image_generator_1",
      "paramKey": "size",
      "currentValue": "512"
    }
  ],
  "combinations": [
    [
      {"nodeId": "image_generator_1", "paramKey": "size", "value": 512},
      {"nodeId": "image_generator_1", "paramKey": "quality", "value": 90}
    ]
  ]
}
```

### 4. 参数组项 (WorkflowParamGroupItem)
- **描述**: 参数组中的单个参数项
- **字段**:
  - `nodeId`: 所属节点ID
  - `paramKey`: 参数键名
  - `currentValue`: 当前值 (JSON字符串)

**示例**:
```json
{
  "id": 1,
  "nodeId": "image_generator_1",
  "paramKey": "size",
  "currentValue": "512",
  "paramGroupId": 1
}
```

### 5. 参数组合 (WorkflowParamCombination)
- **描述**: 参数值的组合配置
- **字段**:
  - `paramValues`: 参数值组合 (JSON格式)

**示例**:
```json
{
  "id": 1,
  "paramValues": [
    {"nodeId": "image_generator_1", "paramKey": "size", "value": 512},
    {"nodeId": "image_generator_1", "paramKey": "quality", "value": 90}
  ],
  "paramGroupId": 1
}
```

## 数据关系图

```
User
  |
  |-- Workflow
        |
        |-- WorkflowParameter
        |
        |-- WorkflowParamGroup
              |
              |-- WorkflowParamGroupItem
              |
              |-- WorkflowParamCombination
```

## 使用场景示例

### 场景1: 创建图像生成工作流
1. 创建Workflow主记录
2. 添加参数:
   - 图像尺寸 (size)
   - 图像质量 (quality)
3. 创建参数组:
   - X轴: 控制图像尺寸
   - Y轴: 控制图像质量
4. 设置参数组合:
   - 512x90
   - 1024x80

### 场景2: 批量执行工作流
1. 读取Workflow配置
2. 解析paramGroups中的参数组合
3. 根据组合生成多个任务
4. 分布式执行任务

这个数据结构设计支持灵活的参数配置和批量任务执行，特别适合需要多维度参数组合的AI工作流场景。
