import { Card, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { 
  workflowDataState, 
  treeDataState, 
  paramGroupsState, 
  expandedKeysState,
  currentGroupIndexState,
  fileListState,
} from '../store/workflow'
import { convertToTreeData } from '../upload/utils'

const { Dragger } = Upload

export const WorkflowUploader = () => {
  const [fileList, setFileList] = useRecoilState(fileListState)
  const setWorkflowData = useSetRecoilState(workflowDataState)
  const setTreeData = useSetRecoilState(treeDataState)
  const setParamGroups = useSetRecoilState(paramGroupsState)
  const setExpandedKeys = useSetRecoilState(expandedKeysState)
  const setCurrentGroupIndex = useSetRecoilState(currentGroupIndexState)

  const handleUpload = async (file: File) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = async () => {
      try {
        const workflow = JSON.parse(reader.result as string)
        setWorkflowData(workflow)
        setTreeData(convertToTreeData(workflow))
        setParamGroups([
          { name: 'X轴', params: [], combinations: [], selectedKeys: [] },
          { name: 'Y轴', params: [], combinations: [], selectedKeys: [] },
          { name: 'Z轴', params: [], combinations: [], selectedKeys: [] }
        ])
        setExpandedKeys([])
        setCurrentGroupIndex(0)
      } catch (error) {
        message.error('Invalid workflow file')
      }
    }
    return false
  }

  return (
    <Card title="上传工作流">
      <Dragger
        name="file"
        multiple={false}
        beforeUpload={handleUpload}
        fileList={fileList}
        onChange={(info) => {
          const newFileList = info.fileList.slice(-1)
          setFileList(newFileList)
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">
          请上传有效的 ComfyUI 工作流 JSON 文件
        </p>
      </Dragger>
    </Card>
  )
} 