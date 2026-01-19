import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AgentProgressEvent, AnalysisTokenUsage } from '../types';

interface UseSocketOptions {
  onProgress?: (event: AgentProgressEvent) => void;
  onTokenUsage?: (usage: AnalysisTokenUsage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSocket(requisitionId: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  
  // 使用 ref 存储回调函数，避免重新创建 socket
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    // 如果已有连接，不重新创建
    if (socketRef.current?.connected) {
      return;
    }

    // 创建 socket 连接 - 连接到后端服务器
    const serverUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket 已连接');
      optionsRef.current.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('WebSocket 已断开');
      optionsRef.current.onDisconnect?.();
    });

    socket.on('agent_progress', (event: AgentProgressEvent) => {
      console.log('收到代理进度:', event);
      optionsRef.current.onProgress?.(event);
      
      // 处理 token 使用量更新
      if (event.type === 'token_usage' && event.data?.totalUsage) {
        optionsRef.current.onTokenUsage?.(event.data.totalUsage as AnalysisTokenUsage);
      }
      
      // 处理分析完成事件中的 token 使用量
      if (event.type === 'analysis_complete' && event.data) {
        const data = event.data as { tokenUsage?: AnalysisTokenUsage };
        if (data.tokenUsage) {
          optionsRef.current.onTokenUsage?.(data.tokenUsage);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // 空依赖数组，只在组件挂载时创建一次

  // 加入职位需求房间
  const joinRequisition = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_requisition', id);
    }
  }, []);

  // 离开职位需求房间
  const leaveRequisition = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_requisition', id);
    }
  }, []);

  // 当 requisitionId 变化时自动加入/离开房间
  useEffect(() => {
    if (requisitionId) {
      joinRequisition(requisitionId);
      return () => {
        leaveRequisition(requisitionId);
      };
    }
  }, [requisitionId, joinRequisition, leaveRequisition]);

  return {
    socket: socketRef.current,
    joinRequisition,
    leaveRequisition
  };
}
