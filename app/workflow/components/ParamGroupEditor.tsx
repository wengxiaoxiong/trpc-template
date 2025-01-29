import { Card, Button, Divider, Input, InputNumber, Tag, Modal, Upload } from 'antd'
import { PlusOutlined, MinusCircleOutlined, PlusCircleOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons'
import { useRecoilState, useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState } from '../store/workflow'
import { useState, useEffect } from 'react'
import { useMinioUpload } from '@/utils/minio/useMinioUpload'
import { trpc } from '@/utils/trpc/client'
import TextArea from 'antd/es/input/TextArea'
import { message } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { FileType } from '@prisma/client'
import { MinioImage } from '@/app/components/MinioImage'

interface ParamGroupEditorProps {
  groupIndex: number
}

export const ParamGroupEditor = ({ groupIndex }: ParamGroupEditorProps) => {
  const [paramGroups, setParamGroups] = useRecoilState(paramGroupsState)
  const workflowData = useRecoilValue(workflowDataState)
  const group = paramGroups[groupIndex]
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [importText, setImportText] = useState('')
  const [currentParamIndex, setCurrentParamIndex] = useState<number | null>(null)
  const [isCombinationsVisible, setIsCombinationsVisible] = useState(false) // 新增状态控制组合的显示
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])

  const utils = trpc.useUtils()

  const { uploadFile, isUploading } = useMinioUpload({
    onSuccess: (pathName) => {
      // 上传成功后的回调会在 handleImageUpload 中处理
    }
  })

  const handleAddCombination = () => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        const newCombination = g.params.map(param => ({
          nodeId: param.nodeId,
          paramKey: param.paramKey,
          value: param.currentValue
        }))
        return {
          ...g,
          combinations: [...g.combinations, newCombination]
        }
      }
      return g
    })
    setParamGroups(newGroups)
  }

  const handleRemoveCombination = (combinationIndex: number) => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        return {
          ...g,
          combinations: g.combinations.filter((_, i) => i !== combinationIndex)
        }
      }
      return g
    })
    setParamGroups(newGroups)
  }

  /**
   * 处理参数值变化的回调函数
   * @param combinationIndex 组合的索引
   * @param paramIndex 参数的索引
   * @param value 新的参数值
   * @param arrayIndex 如果是数组参数，指定要修改的数组索引
   */
  const handleParamValueChange = (
    combinationIndex: number,
    paramIndex: number,
    value: string | number,
    arrayIndex?: number
  ) => {
    // 更新参数组状态
    const newGroups = paramGroups.map((g, index) => {
      // 只处理当前编辑的参数组
      if (index === groupIndex) {
        return {
          ...g,
          // 更新组合列表
          combinations: g.combinations.map((combo, i) => {
            // 找到要修改的组合
            if (i === combinationIndex) {
              return combo.map((param, j) => {
                // 找到要修改的参数
                if (j === paramIndex) {
                  // 如果是数组参数且指定了数组索引
                  if (arrayIndex !== undefined && Array.isArray(param.value)) {
                    // 创建新的数组并更新指定索引的值
                    const newArray = [...param.value]
                    newArray[arrayIndex] = value
                    return { ...param, value: newArray }
                  }
                  // 普通参数直接更新值
                  return { ...param, value }
                }
                // 不是目标参数则保持不变
                return param
              })
            }
            // 不是目标组合则保持不变
            return combo
          })
        }
      }
      // 不是当前编辑的参数组则保持不变
      return g
    })
    // 更新全局状态
    setParamGroups(newGroups)
  }

  const handleRemoveParam = (paramIndex: number) => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        const param = g.params[paramIndex]
        const paramKey = `${param.nodeId}-${param.paramKey}`
        return {
          ...g,
          params: g.params.filter((_, i) => i !== paramIndex),
          combinations: g.combinations.map(combo =>
            combo.filter((_, i) => i !== paramIndex)
          ),
          selectedKeys: g.selectedKeys.filter(key => key !== paramKey)
        }
      }
      return g
    })
    setParamGroups(newGroups)
  }

  const handleBulkImport = (paramIndex: number) => {
    setCurrentParamIndex(paramIndex)
    setIsModalVisible(true)
    setImportText('')  // 清空文本输入
  }

  const handleImportConfirm = async () => {
    try {
      const param = group.params[currentParamIndex!]
      const isImageParameter = isImageParam(param.nodeId, param.paramKey)

      if (isImageParameter) {
        // 处理文件上传列表
        const fileList = await Promise.all(
          uploadFiles.map(async fileInfo => {
            try {
              // 确保 originFileObj 存在
              if (!fileInfo.originFileObj) {
                throw new Error(`文件 ${fileInfo.name} 无效`)
              }
              const pathName = await uploadFile(fileInfo.originFileObj, FileType.PARAMETER_IMAGE)
              return { success: true as const, value: pathName }
            } catch (error) {
              return { success: false as const, error }
            }
          })
        )

        const successfulUploads = fileList.filter((result): result is { success: true, value: string } => 
          result.success
        ).map(result => result.value)

        if (successfulUploads.length === 0) {
          throw new Error('没有文件上传成功')
        }

        setParamGroups(prevGroups => {
          return prevGroups.map((g, index) => {
            if (index === groupIndex) {
              const neededCombinations = Math.max(successfulUploads.length, g.combinations.length)
              const newCombinations = Array.from({ length: neededCombinations }, (_, i) => {
                const existingCombo = g.combinations[i] || g.params.map(param => ({
                  nodeId: param.nodeId,
                  paramKey: param.paramKey,
                  value: param.currentValue
                }))

                if (i < successfulUploads.length && currentParamIndex !== null) {
                  const newCombo = [...existingCombo]
                  newCombo[currentParamIndex] = {
                    ...newCombo[currentParamIndex],
                    value: successfulUploads[i]
                  }
                  return newCombo
                }
                return existingCombo
              })

              return {
                ...g,
                combinations: newCombinations
              }
            }
            return g
          })
        })
      } else {
        // 处理文本导入（保持原有逻辑）
        const values = importText.trim().startsWith('[') ?
          JSON.parse(importText) :
          importText.split('\n').map(value => value.trim()).filter(value => value);

        if (!Array.isArray(values) || values.length === 0) {
          throw new Error('输入不能为空或格式不正确')
        }

        setParamGroups(prevGroups => {
          return prevGroups.map((g, index) => {
            if (index === groupIndex) {
              const neededCombinations = Math.max(values.length, g.combinations.length)
              const newCombinations = Array.from({ length: neededCombinations }, (_, i) => {
                const existingCombo = g.combinations[i] || g.params.map(param => ({
                  nodeId: param.nodeId,
                  paramKey: param.paramKey,
                  value: param.currentValue
                }))

                if (i < values.length && currentParamIndex !== null) {
                  const newCombo = [...existingCombo]
                  newCombo[currentParamIndex] = {
                    ...newCombo[currentParamIndex],
                    value: values[i]
                  }
                  return newCombo
                }
                return existingCombo
              })

              return {
                ...g,
                combinations: newCombinations
              }
            }
            return g
          })
        })
      }

      setIsModalVisible(false)
      setImportText('')
      setUploadFiles([])
    } catch (error) {
      console.error('导入失败:', error)
      message.error('导入失败: ' + (error as Error).message)
    }
  }

  const handleImageUpload = async (combinationIndex: number, paramIndex: number, file: File) => {
    try {
      const pathName = await uploadFile(file, FileType.PARAMETER_IMAGE)
      handleParamValueChange(combinationIndex, paramIndex, pathName)

      // 获取并保存图片URL
      const result = await utils.client.minio.getFileUrl.query({ path: pathName });
      setImageUrls(prev => ({
        ...prev,
        [`${combinationIndex}-${paramIndex}`]: result.url
      }));

      return true
    } catch (error) {
      return false
    }
  }

  const renderImageUpload = (combinationIndex: number, paramIndex: number, paramValue: any) => {
    return (
      <div>
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={({ file }) => {
            if (file instanceof File) {
              handleImageUpload(combinationIndex, paramIndex, file)
            }
          }}
        >
          <Button
            icon={<UploadOutlined />}
            loading={isUploading}
            className="w-full mb-2"
          >
            {paramValue.value ? '更改图片' : '上传图片'}
          </Button>
        </Upload>
        {paramValue.value && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 truncate flex flex-col space-y-3">
              <MinioImage
                pathName={paramValue.value}
                width={100}
                height={100}
                className="object-cover rounded"
              />
              <div>{paramValue.value}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isImageParam = (nodeId: string, paramKey: string) => {
    const node = workflowData?.[nodeId]
    return node?.class_type === 'LoadImage' && paramKey === 'image'
  }

  // 在组件加载时获取已有图片的URL
  useEffect(() => {
    const loadImageUrls = async () => {
      for (let i = 0; i < group.combinations.length; i++) {
        for (let j = 0; j < group.combinations[i].length; j++) {
          const param = group.combinations[i][j];
          if (isImageParam(param.nodeId, param.paramKey) && param.value) {
            try {
              if (typeof param.value === 'string' && !param.value.includes('.') && param.value.includes('/')) {
                const result = await utils.client.minio.getFileUrl.query({ path: param.value });
                setImageUrls(prev => ({
                  ...prev,
                  [`${i}-${j}`]: result.url
                }));
              }
            } catch (error) {
              console.error('获取图片URL失败:', error);
            }
          }
        }
      }
    };

    loadImageUrls();
  }, [group.combinations]);

  if (!workflowData) return null

  return (
    <Card
      key={groupIndex}
      title={
        <div className="flex justify-between items-center">
          <span>{group.name}</span>
        </div>
      }
      className="mt-16"
    >
      <div className="space-y-6">
        {group.params.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {group.params.map((param, paramIndex) => (
                <div key={paramIndex} className="flex items-center justify-between">
                  <span className="font-medium">
                    {`${workflowData[param.nodeId]._meta.title} - ${param.paramKey}`}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="text"
                      onClick={() => handleBulkImport(paramIndex)}
                      icon={<PlusCircleOutlined />}
                    >
                      批量导入
                    </Button>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '确认删除',
                          content: '您确定要删除这个字段吗？',
                          onOk: () => handleRemoveParam(paramIndex),
                        });
                      }}
                    >删除字段</Button>
                  </div>
                </div>
              ))}
            </div>
            <Divider />
            <Button
              type="link"
              onClick={() => setIsCombinationsVisible(!isCombinationsVisible)}
            >
              {isCombinationsVisible ? '隐藏组合' : `显示组合 (${group.combinations.length})`}
            </Button>
            {isCombinationsVisible && group.combinations.map((combination, combinationIndex) => (
              <div key={combinationIndex} className="border p-4 rounded">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">组合 {combinationIndex + 1}</h4>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveCombination(combinationIndex)}
                    disabled={group.combinations.length === 1}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {combination.map((paramValue, paramIndex) => (
                    <div key={paramIndex} className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          {`${workflowData[paramValue.nodeId]._meta.title} - ${paramValue.paramKey}`}
                        </div>
                        {Array.isArray(paramValue.value) ? (
                          <div className="space-y-2">
                            {paramValue.value.map((val, arrayIndex) => (
                              <div key={arrayIndex} className="flex items-center gap-2">
                                <Tag color="blue">{arrayIndex + 1}</Tag>
                                {typeof val === 'number' ? (
                                  <InputNumber
                                    value={val}
                                    onChange={(value) => handleParamValueChange(combinationIndex, paramIndex, value || 0, arrayIndex)}
                                    className="flex-1"
                                  />
                                ) : (
                                  <TextArea
                                    value={val}
                                    onChange={(e) => handleParamValueChange(combinationIndex, paramIndex, e.target.value, arrayIndex)}
                                    className="flex-1"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : isImageParam(paramValue.nodeId, paramValue.paramKey) ? (
                          renderImageUpload(combinationIndex, paramIndex, paramValue)
                        ) : (
                          typeof group.params[paramIndex].currentValue === 'number' ? (
                            <InputNumber
                              value={paramValue.value as number}
                              onChange={(value) => handleParamValueChange(combinationIndex, paramIndex, value || 0)}
                              className="w-full"
                            />
                          ) : (
                            <TextArea
                              value={paramValue.value as string}
                              onChange={(e) => handleParamValueChange(combinationIndex, paramIndex, e.target.value)}
                              className="w-full"
                            />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* 添加组合 */}
            {group.combinations.length > 0 && isCombinationsVisible && (
              <div className="w-full p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                onClick={handleAddCombination}
              >
                <div
                  className="flex justify-center items-center h-10 text-gray-400 hover:text-blue-500"

                >
                  <PlusOutlined />
                  <span className="select-none">添加组合</span>
                </div>
              </div>
            )}

          </>
        ) : (
          <div className="flex text-center text-gray-500 min-h-20 items-center justify-center">
            请从上方选择字段添加到此特征组
          </div>
        )}
      </div>

      <Modal
        title="批量导入"
        visible={isModalVisible}
        onOk={handleImportConfirm}
        onCancel={() => {
          setIsModalVisible(false)
          setImportText('')
          setUploadFiles([])
        }}
      >
        {currentParamIndex !== null && isImageParam(group.params[currentParamIndex].nodeId, group.params[currentParamIndex].paramKey) ? (
          <Upload.Dragger
            multiple
            beforeUpload={(file) => {
              setUploadFiles(prev => [...prev, {
                uid: file.uid || `${Date.now()}-${file.name}`,
                name: file.name,
                status: 'done',
                originFileObj: file
              }])
              return false
            }}
            onRemove={(file) => {
              setUploadFiles(prev => prev.filter(f => f.uid !== file.uid))
            }}
            fileList={uploadFiles}
            accept="image/*"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽图片文件到此区域</p>
            <p className="ant-upload-hint">支持批量上传图片</p>
          </Upload.Dragger>
        ) : (
          <Input.TextArea
            rows={10}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='请输入每行一个的值，或使用JSON数组，例如：["simple1", "simple2"] 或 simple1\nsimple2'
          />
        )}
      </Modal>
    </Card>
  )
} 