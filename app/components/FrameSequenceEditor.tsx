'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, Button, Tooltip, Space, Input } from 'antd';
import { DeleteOutlined, CopyOutlined, EditOutlined, DragOutlined } from '@ant-design/icons';
import { Node, Edge } from 'reactflow';

interface Frame {
  id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
}

interface FrameSequenceEditorProps {
  frames: Frame[];
  setFrames: React.Dispatch<React.SetStateAction<Frame[]>>;
  currentFrameIndex: number;
  setCurrentFrameIndex: React.Dispatch<React.SetStateAction<number>>;
}

const FrameSequenceEditor: React.FC<FrameSequenceEditorProps> = ({ 
  frames, 
  setFrames, 
  currentFrameIndex, 
  setCurrentFrameIndex 
}) => {
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [editingFrameName, setEditingFrameName] = useState('');
  
  // 帧重排序处理
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(frames);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFrames(items);
    
    // 更新当前选中的帧索引
    if (currentFrameIndex === result.source.index) {
      setCurrentFrameIndex(result.destination.index);
    } else if (
      currentFrameIndex > result.source.index && 
      currentFrameIndex <= result.destination.index
    ) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    } else if (
      currentFrameIndex < result.source.index && 
      currentFrameIndex >= result.destination.index
    ) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };
  
  // 添加新帧
  const addNewFrame = () => {
    // 克隆当前帧作为起点
    const currentFrame = frames[currentFrameIndex];
    
    // 创建新帧，深拷贝节点和边
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `帧 ${frames.length + 1}`,
      nodes: currentFrame.nodes.map(node => ({ ...node, id: node.id })),
      edges: currentFrame.edges.map(edge => ({ ...edge, id: edge.id }))
    };
    
    setFrames([...frames, newFrame]);
    setCurrentFrameIndex(frames.length);
  };
  
  // 克隆帧
  const cloneFrame = (index: number) => {
    const frameToClone = frames[index];
    
    const clonedFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `${frameToClone.name} 的副本`,
      nodes: frameToClone.nodes.map(node => ({ ...node, id: node.id })),
      edges: frameToClone.edges.map(edge => ({ ...edge, id: edge.id }))
    };
    
    const newFrames = [...frames];
    newFrames.splice(index + 1, 0, clonedFrame);
    
    setFrames(newFrames);
    
    // 如果克隆的是当前帧之前的帧，需要调整当前帧索引
    if (index < currentFrameIndex) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };
  
  // 删除帧
  const deleteFrame = (index: number) => {
    if (frames.length <= 1) return;
    
    const newFrames = [...frames];
    newFrames.splice(index, 1);
    setFrames(newFrames);
    
    // 调整当前帧索引
    if (currentFrameIndex >= newFrames.length) {
      setCurrentFrameIndex(newFrames.length - 1);
    } else if (currentFrameIndex === index) {
      // 被删除的是当前帧，选择前一帧
      setCurrentFrameIndex(Math.max(0, index - 1));
    } else if (currentFrameIndex > index) {
      // 被删除的是当前帧之前的帧
      setCurrentFrameIndex(currentFrameIndex - 1);
    }
  };
  
  // 编辑帧名称
  const startEditingFrameName = (id: string, name: string) => {
    setEditingFrameId(id);
    setEditingFrameName(name);
  };
  
  const saveFrameName = (id: string) => {
    setFrames(frames.map(frame => 
      frame.id === id ? { ...frame, name: editingFrameName } : frame
    ));
    setEditingFrameId(null);
  };
  
  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">帧序列</h3>
        <Button type="primary" onClick={addNewFrame}>添加新帧</Button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="frames" direction="horizontal">
          {(provided) => (
            <div
              className="flex space-x-2 overflow-x-auto pb-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {frames.map((frame, index) => (
                <Draggable key={frame.id} draggableId={frame.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Card
                        className={`w-40 cursor-pointer ${
                          currentFrameIndex === index ? 'border-2 border-blue-500' : ''
                        }`}
                        onClick={() => setCurrentFrameIndex(index)}
                        hoverable
                        title={
                          <div className="flex justify-between items-center">
                            <span className="text-xs">帧 {index + 1}</span>
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <DragOutlined />
                            </div>
                          </div>
                        }
                        cover={
                          <div className="h-24 flex items-center justify-center bg-gray-100">
                            <div className="text-xs text-gray-500">预览区 {index + 1}</div>
                          </div>
                        }
                        bodyStyle={{ padding: '8px' }}
                        actions={[
                          <Tooltip title="编辑名称" key="edit">
                            <EditOutlined onClick={(e) => {
                              e.stopPropagation();
                              startEditingFrameName(frame.id, frame.name);
                            }} />
                          </Tooltip>,
                          <Tooltip title="复制" key="copy">
                            <CopyOutlined onClick={(e) => {
                              e.stopPropagation();
                              cloneFrame(index);
                            }} />
                          </Tooltip>,
                          <Tooltip title="删除" key="delete">
                            <DeleteOutlined 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFrame(index);
                              }} 
                              className={frames.length <= 1 ? 'text-gray-300' : ''}
                            />
                          </Tooltip>,
                        ]}
                      >
                        <div className="p-1">
                          {editingFrameId === frame.id ? (
                            <Input
                              size="small"
                              value={editingFrameName}
                              onChange={(e) => setEditingFrameName(e.target.value)}
                              onPressEnter={() => saveFrameName(frame.id)}
                              onBlur={() => saveFrameName(frame.id)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="text-center truncate">{frame.name}</div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default FrameSequenceEditor; 