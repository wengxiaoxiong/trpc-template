import { Card, Button, Space, Divider, Input, InputNumber, Tag } from 'antd'
import { PlusOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useRecoilState, useRecoilValue } from 'recoil'
import { workflowDataState, paramGroupsState } from '../store/workflow'
import type { ParamValue } from '../store/workflow'

interface ParamGroupEditorProps {
  groupIndex: number
}

export const ParamGroupEditor = ({ groupIndex }: ParamGroupEditorProps) => {
  const [paramGroups, setParamGroups] = useRecoilState(paramGroupsState)
  const workflowData = useRecoilValue(workflowDataState)
  const group = paramGroups[groupIndex]

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

  const handleAddArrayValue = (
    combinationIndex: number,
    paramIndex: number
  ) => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        return {
          ...g,
          combinations: g.combinations.map((combo, i) => {
            if (i === combinationIndex) {
              return combo.map((param, j) => {
                if (j === paramIndex) {
                  const currentValue = Array.isArray(param.value) ? param.value : [param.value]
                  return { 
                    ...param, 
                    value: [...currentValue, typeof currentValue[0] === 'string' ? '' : 0] 
                  }
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

  const handleRemoveArrayValue = (
    combinationIndex: number,
    paramIndex: number,
    arrayIndex: number
  ) => {
    const newGroups = paramGroups.map((g, index) => {
      if (index === groupIndex) {
        return {
          ...g,
          combinations: g.combinations.map((combo, i) => {
            if (i === combinationIndex) {
              return combo.map((param, j) => {
                if (j === paramIndex && Array.isArray(param.value)) {
                  return { 
                    ...param, 
                    value: param.value.filter((_, idx) => idx !== arrayIndex)
                  }
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

  if (!workflowData) return null

  return (
    <Card 
      key={groupIndex}
      title={
        <div className="flex justify-between items-center">
          <span>{group.name}</span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCombination}
          >
            添加组合
          </Button>
        </div>
      }
      className="mt-6"
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
                  <Button 
                    type="text" 
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveParam(paramIndex)}
                  />
                </div>
              ))}
            </div>
            <Divider />
            {group.combinations.map((combination, combinationIndex) => (
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
          </>
        ) : (
          <div className="text-center text-gray-500">
            请从右侧选择参数添加到此特征组
          </div>
        )}
      </div>
    </Card>
  )
} 