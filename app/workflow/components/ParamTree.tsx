import { Card, Tree, Radio, Space, Button, Modal } from 'antd'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  workflowDataState,
  treeDataState,
  paramGroupsState,
  expandedKeysState,
  currentGroupIndexState,
  fileListState,
} from '../store/workflow'
import type { SelectedParam } from '../store/workflow'
import { useEffect } from 'react'

export const ParamTree = () => {
  const [expandedKeys, setExpandedKeys] = useRecoilState(expandedKeysState)
  const [currentGroupIndex, setCurrentGroupIndex] = useRecoilState(currentGroupIndexState)
  const [paramGroups, setParamGroups] = useRecoilState(paramGroupsState)
  const workflowData = useRecoilValue(workflowDataState)
  const treeData = useRecoilValue(treeDataState)
  const setFileList = useSetRecoilState(fileListState)
  const setWorkflowData = useSetRecoilState(workflowDataState)
  const fileList = useRecoilValue(fileListState)

  // 获取文件名
  const workflowName = fileList.length > 0 ? fileList[0].name : '未命名工作流'

  // 获取所有可展开的节点key
  const getAllExpandableKeys = () => {
    const keys: string[] = []
    treeData.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key as string)
      }
    })
    return keys
  }

  // 处理展开/收起全部
  const handleExpandAll = () => {
    if (expandedKeys.length > 0) {
      setExpandedKeys([]) // 收起全部
    } else {
      setExpandedKeys(getAllExpandableKeys()) // 展开全部
    }
  }

  // 当treeData变化时，自动展开已选择字段的父元素
  useEffect(() => {
    if (treeData.length > 0) {
      const selectedKeys = paramGroups[currentGroupIndex].selectedKeys;
      const parentKeys = new Set<string>();

      selectedKeys.forEach(key => {
        const parts = key.split('-');
        if (parts.length > 1) {
          parentKeys.add(parts[0]); // 假设父节点的key是nodeId
        }
      });

      setExpandedKeys(Array.from(parentKeys));
    }
  }, [treeData, paramGroups, currentGroupIndex]);

  const handleSelect = (newSelectedKeys: React.Key[], info: any) => {
    // 找出被点击的节点
    const clickedKey = info.node.key as string
    if (!clickedKey || !clickedKey.includes('-')) return

    const [nodeId, paramKey] = clickedKey.split('-')
    if (!workflowData || !workflowData[nodeId]) return

    const currentGroup = paramGroups[currentGroupIndex]
    const isKeySelected = currentGroup.selectedKeys.includes(clickedKey)

    // 如果已经在其他组中
    const isParamInOtherGroup = paramGroups.some((group, index) => 
      index !== currentGroupIndex && group.params.some(p => p.nodeId === nodeId && p.paramKey === paramKey)
    )

    if (isParamInOtherGroup) {
      return
    }

    const currentValue = workflowData[nodeId].inputs[paramKey]
    
    const newGroups = paramGroups.map((group, index) => {
      if (index === currentGroupIndex) {
        if (!isKeySelected) {
          // 添加参数
          const newParam: SelectedParam = {
            nodeId,
            paramKey,
            path: [nodeId, 'inputs', paramKey],
            currentValue,
          }
          return {
            ...group,
            params: [...group.params, newParam],
            combinations: group.combinations.length === 0
              ? [[{ nodeId, paramKey, value: currentValue }]]
              : group.combinations.map(combo => [...combo, { nodeId, paramKey, value: currentValue }]),
            selectedKeys: [...group.selectedKeys, clickedKey]
          }
        } else {
          // 移除参数，弹窗确认
          Modal.confirm({
            title: '确认删除',
            content: '您确定要删除这个字段吗？',
            onOk: () => {
              const updatedGroup = {
                ...group,
                params: group.params.filter(p => !(p.nodeId === nodeId && p.paramKey === paramKey)),
                combinations: group.combinations.map(combo => 
                  combo.filter(v => !(v.nodeId === nodeId && v.paramKey === paramKey))
                ),
                selectedKeys: group.selectedKeys.filter(k => k !== clickedKey)
              }
              setParamGroups(prevGroups => {
                const newGroups = [...prevGroups]
                newGroups[index] = updatedGroup
                return newGroups
              })
            }
          });
          return group; // 直接返回，不做其他处理
        }
      }
      return group
    })
    
    setParamGroups(newGroups)
  }

  const resetAll = () => {
    setWorkflowData(null)
    setFileList([])
    setParamGroups([
      { name: 'X轴', params: [], combinations: [], selectedKeys: [] },
      { name: 'Y轴', params: [], combinations: [], selectedKeys: [] },
      { name: 'Z轴', params: [], combinations: [], selectedKeys: [] }
    ])
    setExpandedKeys([])
    setCurrentGroupIndex(0)
  }

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>选择参数</span>
            <span className="text-sm text-gray-500">({workflowName})</span>
          </div>
          <Space>
            <Button 
              type="link"
              onClick={handleExpandAll}
            >
              {expandedKeys.length > 0 ? '收起全部' : '展开全部'}
            </Button>
            <Radio.Group 
              value={currentGroupIndex} 
              onChange={(e) => {
                setCurrentGroupIndex(e.target.value)
              }}
              buttonStyle="solid"
            >
              {paramGroups.map((group, index) => (
                <Radio.Button key={index} value={index}>
                  {group.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Space>
        </div>
      }
    >
      <Tree
        treeData={treeData}
        selectedKeys={paramGroups[currentGroupIndex].selectedKeys}
        expandedKeys={expandedKeys}
        onSelect={handleSelect}
        onExpand={setExpandedKeys}
        multiple
        onClick={(e, node) => {
          if (!node.isLeaf) {
            setExpandedKeys(
              expandedKeys.includes(node.key)
                ? expandedKeys.filter(k => k !== node.key)
                : [...expandedKeys, node.key]
            )
          }
        }}
      />
    </Card>
  )
} 