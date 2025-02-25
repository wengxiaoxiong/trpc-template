import { atom } from 'recoil';
import { Stage, Message } from '../types';
import { initialStages, initialMessages } from './initialData';

// 存储所有阶段信息
export const stagesState = atom<Stage[]>({
  key: 'stagesState',
  default: initialStages,
});

// 存储选中的概念ID
export const selectedConceptIdsState = atom<number[]>({
  key: 'selectedConceptIdsState',
  default: [],
});

// 存储聊天消息
export const messagesState = atom<Message[]>({
  key: 'messagesState',
  default: initialMessages,
});

// 存储输入框消息
export const inputMessageState = atom<string>({
  key: 'inputMessageState',
  default: '',
}); 