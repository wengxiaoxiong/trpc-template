import type { DataNode } from 'antd/es/tree'
import type { WorkflowData } from './store/workflow'

export const convertToTreeData = (data: WorkflowData): DataNode[] => {
  const result: DataNode[] = []
  
  Object.entries(data).forEach(([nodeId, node]) => {
    const nodeItem: DataNode = {
      title: `${node._meta.title} (${nodeId})`,
      key: nodeId,
      children: []
    }

    Object.entries(node.inputs).forEach(([paramKey, value]) => {
      // 如果value是数组则跳过
      if (Array.isArray(value)) {
        return
      }

      const displayValue = typeof value === 'string' ? `"${value}"` : value
      
      const paramNode: DataNode = {
        title: `${paramKey} (当前值: ${displayValue})`,
        key: `${nodeId}-${paramKey}`,
        isLeaf: true,
      }
      nodeItem.children?.push(paramNode)
    })

    // 只有当nodeItem有子节点时才push到result中
    if (nodeItem.children && nodeItem.children.length > 0) {
      result.push(nodeItem)
    }
  })

  return result
} 