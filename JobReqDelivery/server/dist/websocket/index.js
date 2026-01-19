export function setupWebSocket(io) {
    io.on('connection', (socket) => {
        console.log(`📱 客户端已连接: ${socket.id}`);
        // 加入特定职位需求的房间
        socket.on('join_requisition', (requisitionId) => {
            socket.join(`requisition_${requisitionId}`);
            console.log(`📋 客户端 ${socket.id} 加入房间: requisition_${requisitionId}`);
        });
        // 离开职位需求房间
        socket.on('leave_requisition', (requisitionId) => {
            socket.leave(`requisition_${requisitionId}`);
            console.log(`📋 客户端 ${socket.id} 离开房间: requisition_${requisitionId}`);
        });
        // 断开连接
        socket.on('disconnect', () => {
            console.log(`📴 客户端已断开: ${socket.id}`);
        });
    });
}
// 发送代理进度更新的辅助函数
export function emitAgentProgress(io, requisitionId, event) {
    // 如果没有 io 实例（如在测试环境中），跳过 WebSocket 发送
    if (!io) {
        return;
    }
    io.to(`requisition_${requisitionId}`).emit('agent_progress', {
        ...event,
        timestamp: new Date()
    });
}
//# sourceMappingURL=index.js.map