'use client'

import { useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState } from './store/workflow'
import { DashboardLayout } from '../components/DashboardLayout'
import { WorkflowUploader } from './components/WorkflowUploader'
import { ParamTree } from './components/ParamTree'
import { ParamGroupEditor } from './components/ParamGroupEditor'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

export default function UploadPage() {
  const workflowData = useRecoilValue(workflowDataState)
  const paramGroups = useRecoilValue(paramGroupsState)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">上传并配置工作流</h2>
          <Button icon={<SaveOutlined />}>保存工作流配置</Button>
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
      </div>
    </DashboardLayout>
  )
}