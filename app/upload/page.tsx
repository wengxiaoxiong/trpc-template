'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { DashboardLayout } from '../components/DashboardLayout'
import type { UploadFile } from 'antd/es/upload/interface'

const { Dragger } = Upload

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const { mutateAsync: uploadWorkflow } = trpc.workflow.create.useMutation({
    onSuccess: () => {
      message.success('Workflow uploaded successfully')
      router.push('/')
    },
    onError: (error) => {
      message.error(error.message)
    },
  })

  const handleUpload = async (file: File) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = async () => {
      const workflow = JSON.parse(reader.result as string)
      await uploadWorkflow({
        payload: {
          name: file.name,
          description: 'Uploaded workflow',
          workflow: JSON.stringify(workflow),
        },
      })
    }
    return false
  }

  return (
    <DashboardLayout>


      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Upload Workflow
            </h2>
          </div>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={handleUpload}
            fileList={fileList}
            onChange={(info) => setFileList(info.fileList)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
          </Dragger>
        </div>
      </div>
    </DashboardLayout>
  )
}