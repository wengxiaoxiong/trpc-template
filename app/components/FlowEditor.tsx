'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  MarkerType,
  Panel,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Space, Tooltip, Divider } from 'antd';
import { PlusOutlined, ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';

// 自定义节点类型
const nodeTypes = {
  // 可以在这里添加自定义节点类型
};

interface FlowEditorProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onFlowChange: () => void;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ 
  nodes, 
  setNodes, 
  edges, 
  setEdges,
  onFlowChange
}) => {
  const [selectedElements, setSelectedElements] = useState<(Node | Edge)[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      onFlowChange();
    },
    [nodes, setNodes, onFlowChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onFlowChange();
    },
    [edges, setEdges, onFlowChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      onFlowChange();
    },
    [setEdges, onFlowChange]
  );

  // 添加默认节点
  const addDefaultNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: `新节点 ${nodes.length + 1}` }
    };
    setNodes((nds) => [...nds, newNode]);
    onFlowChange();
  };

  // 添加输入节点
  const addInputNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'input',
      position: { x: 100, y: 200 },
      data: { label: `输入节点 ${nodes.length + 1}` }
    };
    setNodes((nds) => [...nds, newNode]);
    onFlowChange();
  };

  // 添加输出节点
  const addOutputNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'output',
      position: { x: 100, y: 300 },
      data: { label: `输出节点 ${nodes.length + 1}` }
    };
    setNodes((nds) => [...nds, newNode]);
    onFlowChange();
  };

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedElements([...nodes, ...edges]);
    },
    []
  );

  const deleteSelected = () => {
    const selectedNodeIds = new Set(
      selectedElements
        .filter((el) => 'position' in el)
        .map((el) => el.id)
    );
    
    const selectedEdgeIds = new Set(
      selectedElements
        .filter((el) => !('position' in el))
        .map((el) => el.id)
    );
    
    setNodes((nodes) => nodes.filter((node) => !selectedNodeIds.has(node.id)));
    setEdges((edges) => edges.filter((edge) => !selectedEdgeIds.has(edge.id)));
    onFlowChange();
  };

  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'input':
        return '#6ede87';
      case 'output':
        return '#ff0072';
      default:
        return '#1890ff';
    }
  };

  return (
    <div className="h-[500px] border border-gray-200 rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={nodeColor} />
        <Panel position="top-left">
          <div className="bg-white p-2 rounded shadow-md">
            <Space direction="vertical">
              <Space>
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={addDefaultNode}
                >
                  基本节点
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={addInputNode}
                >
                  输入节点
                </Button>
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={addOutputNode}
                >
                  输出节点
                </Button>
              </Space>
              
              <Divider style={{ margin: '8px 0' }} />
              
              <Space>
                <Tooltip title="删除选中元素">
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={deleteSelected}
                    disabled={selectedElements.length === 0}
                    danger
                  />
                </Tooltip>
              </Space>
            </Space>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default FlowEditor; 