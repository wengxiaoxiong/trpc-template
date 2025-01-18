'use client'

import { useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState } from './store/workflow'
import { DashboardLayout } from '../components/DashboardLayout'
import { WorkflowUploader } from './components/WorkflowUploader'
import { ParamTree } from './components/ParamTree'
import { ParamGroupEditor } from './components/ParamGroupEditor'

export default function UploadPage() {
  const workflowData = useRecoilValue(workflowDataState)
  const paramGroups = useRecoilValue(paramGroupsState)

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">上传并配置工作流</h2>
        
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