import { useState, useEffect, useCallback } from "react";
import { getData } from "../services/api-service";
import { useSocket } from "./useSocket";
import { SocketEvent, ConversationUpdatedPayload, MessageCreatedPayload } from "../types/socket.types";
import { ConversationItem } from "../pages/chat/component/ChatSidebar";

export function useUnreadChatCount() {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const { socket } = useSocket();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await getData<{ data?: { data?: ConversationItem[] } } | ConversationItem[]>({
                url: "message/conversations?page=1&limit=50",
            });
            let items: ConversationItem[] = [];
            if (Array.isArray(res)) {
                items = res;
            } else if (res && typeof res === "object") {
                const responseData = (res as { data?: { data?: ConversationItem[] } | ConversationItem[] }).data;
                if (Array.isArray(responseData)) {
                    items = responseData;
                } else if (responseData && typeof responseData === "object" && Array.isArray(responseData.data)) {
                    items = responseData.data;
                }
            }

            const totalUnread = items.reduce(
                (sum, conv) => sum + (Number(conv.unreadCountAdmin) || 0),
                0
            );
            setUnreadCount(totalUnread);
        } catch {
            // Silently ignore background query error
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Real-time socket updates for incoming messages and conversation state
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (payload: MessageCreatedPayload) => {
            if (payload?.senderRole === "customer") {
                fetchUnreadCount();
            }
        };

        const handleConvUpdate = (payload: ConversationUpdatedPayload) => {
            if (payload?.conversationId) {
                fetchUnreadCount();
            }
        };

        socket.on(SocketEvent.MESSAGE_CREATED, handleMessage);
        socket.on(SocketEvent.CONVERSATION_UPDATED, handleConvUpdate);

        const handleChatRead = () => {
            fetchUnreadCount();
        };
        window.addEventListener("admin_chat_read", handleChatRead);

        return () => {
            socket.off(SocketEvent.MESSAGE_CREATED, handleMessage);
            socket.off(SocketEvent.CONVERSATION_UPDATED, handleConvUpdate);
            window.removeEventListener("admin_chat_read", handleChatRead);
        };
    }, [socket, fetchUnreadCount]);

    return {
        unreadChatCount: unreadCount,
        refetch: fetchUnreadCount
    };
}
