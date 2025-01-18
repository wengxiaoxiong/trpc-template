'use client'

import { useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState, fileListState } from './store/workflow'
import { DashboardLayout } from '../components/DashboardLayout'
import { WorkflowUploader } from './components/WorkflowUploader'
import { ParamTree } from './components/ParamTree'
import { ParamGroupEditor } from './components/ParamGroupEditor'
import { Button, message, Modal, Input } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'

export default function UploadPage() {
  const workflowData = useRecoilValue(workflowDataState)
  const paramGroups = useRecoilValue(paramGroupsState)
  const fileList = useRecoilValue(fileListState)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDesc, setWorkflowDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const { mutateAsync: createWorkflow } = trpc.workflow.create.useMutation({
    onSuccess: () => {
      message.success('工作流保存成功')
      setIsModalVisible(false)
    },
    onError: (error) => {
      message.error(error.message)
    },
  })

  const handleSave = async () => {
    if (!workflowData) {
      message.error('请先上传工作流')
      return
    }

    // 获取文件名（不包含扩展名）作为默认工作流名称
    const defaultName = fileList.length > 0 
      ? fileList[0].name.replace(/\.json$/, '')
      : '未命名工作流'
    
    setWorkflowName(defaultName)
    setWorkflowDesc('')
    setIsPublic(false)
    setIsModalVisible(true)
  }

  const handleConfirmSave = async () => {
    if (!workflowName.trim()) {
      message.error('请输入工作流名称')
      return
    }

    try {
      // 准备参数数据
      const parameters = paramGroups.flatMap(group => 
        group.params.map(param => ({
          name: `${param.nodeId}-${param.paramKey}`,
          type: typeof param.currentValue === 'number' ? 'number' : 'string',
          description: `${group.name}: ${workflowData![param.nodeId]._meta.title} - ${param.paramKey}`,
          default: JSON.stringify(param.currentValue),
          nodeId: param.nodeId,
          paramKey: param.paramKey
        }))
      )

      // 保存工作流
      await createWorkflow({
        name: workflowName,
        description: workflowDesc,
        content: {
          workflow: workflowData,
          paramGroups: paramGroups
        },
        workflow: workflowData,
        isPublic,
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
      })
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">上传并配置工作流</h2>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!workflowData}
          >
            保存工作流配置
          </Button>
        </div>
        <div className="w-full">
          {!workflowData ? (
            <WorkflowUploader />
          ) : (
            <ParamTree />
          )}
        </div>

        {paramGroups.map((_, groupIndex) => (
          <ParamGroupEditor key={groupIndex} groupIndex={groupIndex} />
        ))}

        <Modal
          title="保存工作流"
          open={isModalVisible}
          onOk={handleConfirmSave}
          onCancel={() => setIsModalVisible(false)}
          okText="保存"
          cancelText="取消"
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2">工作流名称</div>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="请输入工作流名称"
              />
            </div>
            <div>
              <div className="mb-2">描述（可选）</div>
              <Input.TextArea
                value={workflowDesc}
                onChange={(e) => setWorkflowDesc(e.target.value)}
                placeholder="请输入工作流描述"
                rows={4}
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>公开此工作流（其他用户可见）</span>
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}