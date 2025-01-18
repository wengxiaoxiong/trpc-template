import { atom } from 'recoil'
import type { DataNode } from 'antd/es/tree'

export interface WorkflowData {
  [key: string]: {
    inputs: {
      [key: string]: any
    }
    class_type: string
    _meta: {
      title: string
    }
  }
}

export interface ParamValue {
  nodeId: string
  paramKey: string
  value: string | number | (string | number)[]
}

export interface SelectedParam {
  nodeId: string
  paramKey: string
  path: string[]
  currentValue: any
}

export interface ParamGroup {
  name: string
  params: SelectedParam[]
  combinations: ParamValue[][]
  selectedKeys: string[]
}

export const workflowDataState = atom<WorkflowData | null>({
  key: 'workflowDataState',
  default: null,
})

export const treeDataState = atom<DataNode[]>({
  key: 'treeDataState',
  default: [],
})

export const paramGroupsState = atom<ParamGroup[]>({
  key: 'paramGroupsState',
  default: [
    { name: 'X轴', params: [], combinations: [], selectedKeys: [] },
    { name: 'Y轴', params: [], combinations: [], selectedKeys: [] },
    { name: 'Z轴', params: [], combinations: [], selectedKeys: [] }
  ],
})

export const selectedKeysState = atom<string[]>({
  key: 'selectedKeysState',
  default: [],
})

export const expandedKeysState = atom<React.Key[]>({
  key: 'expandedKeysState',
  default: [],
})

export const currentGroupIndexState = atom<number>({
  key: 'currentGroupIndexState',
  default: 0,
})

export const fileListState = atom<any[]>({
  key: 'fileListState',
  default: [],
}) 