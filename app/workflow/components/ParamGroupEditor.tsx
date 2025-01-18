import { Card, Button, Space, Divider, Input, InputNumber, Tag, Modal } from 'antd'
import { PlusOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useRecoilState, useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState } from '../store/workflow'
import { useState } from 'react'

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

  const handleParamValueChange = (
    combinationIndex: number,
    paramIndex: number,
    value: string | number,
    arrayIndex?: number
  ) => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        return {
          ...g,
          combinations: g.combinations.map((combo, i) => {
            if (i === combinationIndex) {
              return combo.map((param, j) => {
                if (j === paramIndex) {
                  if (arrayIndex !== undefined && Array.isArray(param.value)) {
                    const newArray = [...param.value]
                    newArray[arrayIndex] = value
                    return { ...param, value: newArray }
                  }
                  return { ...param, value }
                }
                return param
              })
            }
            return combo
          })
        }
      }
      return g
    })
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
  }

  const handleImportConfirm = () => {
    try {
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

      setIsModalVisible(false)
      setImportText('')
    } catch (error) {
      console.error('导入失败:', error)
      // 这里可以添加错误提示
    }
  }

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
              {isCombinationsVisible ? '隐藏组合' : '显示组合'}
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
                                  <Input
                                    value={val}
                                    onChange={(e) => handleParamValueChange(combinationIndex, paramIndex, e.target.value, arrayIndex)}
                                    className="flex-1"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          typeof group.params[paramIndex].currentValue === 'number' ? (
                            <InputNumber
                              value={paramValue.value}
                              onChange={(value) => handleParamValueChange(combinationIndex, paramIndex, value || 0)}
                              className="w-full"
                            />
                          ) : (
                            <Input
                              value={paramValue.value as string}
                              onChange={(e) => handleParamValueChange(combinationIndex, paramIndex, e.target.value)}
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
              <div className="w-full p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div 
                  className="flex justify-center items-center h-10 text-gray-400 hover:text-blue-500"
                  onClick={handleAddCombination}
                >
                  <PlusOutlined />添加组合
                </div>
              </div>
            )}

          </>
        ) : (
          <div className="flex text-center text-gray-500 min-h-20 items-center justify-center">
            请从右侧选择参数添加到此特征组
          </div>
        )}
      </div>

      <Modal
        title="批量导入"
        visible={isModalVisible}
        onOk={handleImportConfirm}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input.TextArea
          rows={10}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='请输入每行一个的值，或使用JSON数组，例如：["simple1", "simple2"] 或 simple1\nsimple2'
        />
      </Modal>
    </Card>
  )
} 