import { Card, Tree, Radio, Space, Button } from 'antd'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  workflowDataState,
  treeDataState,
  paramGroupsState,
  expandedKeysState,
  currentGroupIndexState,
  fileListState,
} from '../store/workflow'
import type { SelectedParam, ParamValue } from '../store/workflow'

export const ParamTree = () => {
  const [expandedKeys, setExpandedKeys] = useRecoilState(expandedKeysState)
  const [currentGroupIndex, setCurrentGroupIndex] = useRecoilState(currentGroupIndexState)
  const [paramGroups, setParamGroups] = useRecoilState(paramGroupsState)
  const workflowData = useRecoilValue(workflowDataState)
  const treeData = useRecoilValue(treeDataState)
  const setFileList = useSetRecoilState(fileListState)
  const setWorkflowData = useSetRecoilState(workflowDataState)

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
          // 移除参数
          return {
            ...group,
            params: group.params.filter(p => !(p.nodeId === nodeId && p.paramKey === paramKey)),
            combinations: group.combinations.map(combo => 
              combo.filter(v => !(v.nodeId === nodeId && v.paramKey === paramKey))
            ),
            selectedKeys: group.selectedKeys.filter(k => k !== clickedKey)
          }
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
          <span>选择参数</span>
          <Space>
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
            <Button 
              type="link" 
              onClick={resetAll}
            >
              重新上传
            </Button>
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