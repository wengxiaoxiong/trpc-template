'use client'

import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { 
  workflowDataState, 
  paramGroupsState, 
  treeDataState,
  expandedKeysState,
  currentGroupIndexState,
  fileListState,
} from '@/app/workflow/store/workflow'
import { Button, message, notification } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import { convertToTreeData } from '@/app/workflow/upload/utils'
import { ParamGroupEditor } from '../../components/ParamGroupEditor'
import { ParamTree } from '../../components/ParamTree'
import { MainPageLayout } from '@/app/components/MainPageLayout'

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
  const [workflowData, setWorkflowData] = useRecoilState(workflowDataState)
  const [paramGroups, setParamGroups] = useRecoilState(paramGroupsState)
  const setTreeData = useSetRecoilState(treeDataState)
  const setExpandedKeys = useSetRecoilState(expandedKeysState)
  const setCurrentGroupIndex = useSetRecoilState(currentGroupIndexState)
  const setFileList = useSetRecoilState(fileListState)

  const { data: workflow, isLoading, refetch } = trpc.workflow.getById.useQuery({ 
    id: parseInt(params.id) 
  })

  const { mutateAsync: updateWorkflow } = trpc.workflow.update.useMutation({
    onSuccess: async () => {
      
      await refetch()
      message.success('工作流获取更新成功')
    },
    onError: (error) => {
      message.error(error.message)
    },
  })

  // 加载工作流数据
  useEffect(() => {
    if (workflow) {
      // 设置工作流数据
      const workflowContent = workflow.content as any
      setWorkflowData(workflowContent)
      setTreeData(convertToTreeData(workflowContent))
      
      // 设置参数组
      const paramGroups = workflow.paramGroups.map(group => ({
        name: group.name,
        params: group.params.map(param => ({
          nodeId: param.nodeId,
          paramKey: param.paramKey,
          currentValue: JSON.parse(param.currentValue),
          path: [param.nodeId, 'inputs', param.paramKey]
        })),
        combinations: (group.combinations || []).map(combo => combo.paramValues as any),
        selectedKeys: group.params.map(param => `${param.nodeId}-${param.paramKey}`)
      }))
      setParamGroups(paramGroups)

      // 设置其他状态
      setExpandedKeys([])
      setCurrentGroupIndex(0)
      setFileList([{ name: workflow.name }])
    }
  }, [workflow])

  const handleSave = async () => {
    if (!workflowData || !workflow) {
      return
    }

    // 显示loading的toast
    const loadingMessage = message.loading('正在保存...', 0);

    try {
      // 准备参数数据
      const parameters = paramGroups.flatMap(group => 
        group.params.map(param => ({
          name: `${param.nodeId}-${param.paramKey}`,
          type: typeof param.currentValue === 'number' ? 'number' : 'string',
          description: `${group.name}: ${workflowData[param.nodeId]._meta.title} - ${param.paramKey}`,
          default: JSON.stringify(param.currentValue),
          nodeId: param.nodeId,
          paramKey: param.paramKey
        }))
      )

      // 更新工作流
      await updateWorkflow({
        id: workflow.id,
        data: {
          name: workflow.name,
          description: workflow.description || undefined,
          content: {
            workflow: workflowData,
            paramGroups: paramGroups
          },
          workflow: workflowData,
          isPublic: workflow.isPublic,
          parameters,
          paramGroups: paramGroups.map(group => ({
            name: group.name,
            params: group.params.map(param => ({
              nodeId: param.nodeId,
              paramKey: param.paramKey,
              currentValue: param.currentValue,
              path: param.path
            })),
            combinations: group.combinations,
            selectedKeys: group.selectedKeys
          }))
        }
      })
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    } finally {
      // 关闭loading的toast
      loadingMessage();
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <MainPageLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">编辑工作流: {workflow?.name}</h2>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!workflowData}
          >
            保存修改
          </Button>
        </div>
        <div className="w-full">
          {workflowData && <ParamTree />}
        </div>

        {paramGroups.map((_, groupIndex) => (
          <ParamGroupEditor key={groupIndex} groupIndex={groupIndex} />
        ))}
      </div>
    </MainPageLayout>
  )
} 