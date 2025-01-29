'use client'

import { useRecoilValue } from 'recoil'
import { workflowDataState, fileListState } from '../store/workflow'
import { MainPageLayout } from '../../components/MainPageLayout'
import { WorkflowUploader } from '../components/WorkflowUploader'
import { Button, message, Modal, Input, Checkbox } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { WorkflowList } from '@/app/components/WorkflowList'

export default function UploadPage() {
  const workflowData = useRecoilValue(workflowDataState)
  const fileList = useRecoilValue(fileListState)
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDesc, setWorkflowDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const { mutateAsync: createWorkflow } = trpc.workflow.create.useMutation({
    onSuccess: (data) => {
      message.success('工作流上传成功')
      router.push(`/workflow/edit/${data.id}`)
    },
    onError: (error) => {
      message.error(error.message)
    },
  })

  const handleSave = () => {
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
      // 创建一个基础的工作流记录
      await createWorkflow({
        name: workflowName,
        description: workflowDesc,
        content: workflowData,
        workflow: workflowData,
        isPublic,
        parameters: [],
        paramGroups: [{
          name: 'X轴',
          params: [],
          combinations: [],
          selectedKeys: []
        }, {
          name: 'Y轴',
          params: [],
          combinations: [],
          selectedKeys: []
        }, {
          name: 'Z轴',
          params: [],
          combinations: [],
          selectedKeys: []
        }]
      })
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    }
  }

  return (
    <MainPageLayout>

      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">上传工作流</h1>
        <WorkflowUploader >
          {workflowData && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              className="mt-4"
            >
              保存并继续编辑
            </Button>
          )}
        </WorkflowUploader>
      </div>


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
            <Checkbox
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            >
              公开此工作流（其他用户可见）
            </Checkbox>
          </div>
        </div>
      </Modal>
      <div className='mt-12'>
        <WorkflowList />
      </div>
    </MainPageLayout>
  )
}