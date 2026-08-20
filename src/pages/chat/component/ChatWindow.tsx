import { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import avatar from "/images/avatar.png";
import moment from "moment";
import { ConversationItem } from "./ChatSidebar";

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: "customer" | "admin";
    content: string;
    isRead: boolean;
    createdAt: string;
}

const requiredFields: any = [
    { key: "conversationId", value: "conversationId" },
    { key: "content", value: "content", label: "text" },
];

const ChatWindow = ({ selectedUser }: { selectedUser: ConversationItem }) => {
    const { fetchData, postMutation, handleApiMutation } = useAPI();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isLoadingThread, setIsLoadingLoadingThread] = useState(false);
    const [content, setContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const oldestCursor = messages.length > 0 ? messages[0].id : undefined;
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchThread = async (isInitial = false) => {
        if (!selectedUser?.id) return;
        if (isInitial) setIsLoadingLoadingThread(true);

        try {
            const response = await fetchData({
                apiUrl: `${apiConfig.messageLinks.converstionThreadUrl}?conversationId=${selectedUser.id}&limit=50`
            });

            let items: Message[] = [];
            if (Array.isArray(response)) {
                items = response;
            } else if (Array.isArray(response?.data)) {
                items = response.data;
            }

            if (items.length > 0 || isInitial) {
                setMessages(items);
                if (isInitial) {
                    setTimeout(scrollToBottom, 100);
                }
            }
        } catch (error) {
            console.error("Error fetching messages thread:", error);
        } finally {
            if (isInitial) setIsLoadingLoadingThread(false);
        }
    };

    const handleLoadOlderMessages = async () => {
        if (!oldestCursor || isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const response = await fetchData({
                apiUrl: `${apiConfig.messageLinks.converstionThreadUrl}?conversationId=${selectedUser.id}&cursor=${oldestCursor}&limit=50`
            });

            let items: Message[] = [];
            if (Array.isArray(response)) {
                items = response;
            } else if (Array.isArray(response?.data)) {
                items = response.data;
            }

            if (items.length > 0) {
                setMessages(prev => [...items, ...prev]);
            }
        } catch (error) {
            console.error("Error loading older messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!selectedUser?.id) return;
        fetchThread(true);

        // Polling thread for incoming customer messages every 2.5s
        const interval = setInterval(() => {
            fetchThread(false);
        }, 2500);

        return () => clearInterval(interval);
    }, [selectedUser?.id]);

    const handleSendMessage = async () => {
        if (!content.trim() || isMessageLoading) return;
        setIsMessageLoading(true);

        const currentContent = content.trim();
        setContent("");

        try {
            const payload = {
                conversationId: selectedUser.id,
                content: currentContent,
            };

            const result = await handleApiMutation({
                mutation: postMutation,
                url: apiConfig.messageLinks.adminReplyUrl,
                body: payload,
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields
            });

            if (result?.success || result?.data) {
                await fetchThread(false);
                setTimeout(scrollToBottom, 100);
            } else {
                // Restore input on failure
                setContent(currentContent);
            }
        } catch (error) {
            console.error("Error sending admin reply:", error);
            setContent(currentContent);
        } finally {
            setIsMessageLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const customerName = selectedUser?.customer?.name || `Customer #${selectedUser.customerId.slice(0, 6)}`;
    const customerEmail = selectedUser?.customer?.email || "";
    const customerPhone = selectedUser?.customer?.phone || "";

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                        <img
                            src={avatar}
                            alt={customerName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                            }}
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 leading-tight">{customerName}</p>
                        <p className="text-xs text-gray-500">
                            {customerEmail} {customerPhone ? `• ${customerPhone}` : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 px-6 py-4 max-h-[610px] overflow-y-auto space-y-3">
                {messages.length >= 50 && (
                    <div className="flex justify-center mb-2">
                        <button
                            onClick={handleLoadOlderMessages}
                            disabled={isLoadingMore}
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-1 rounded-full transition-colors cursor-pointer"
                        >
                            {isLoadingMore ? "Loading earlier messages..." : "↑ Load earlier messages"}
                        </button>
                    </div>
                )}

                {isLoadingThread ? (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400">
                        <p>No messages yet in this conversation.</p>
                        <p className="text-xs text-gray-400 mt-1">Send a message below to start chatting.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderRole === "admin";

                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`flex items-end space-x-2 max-w-xs md:max-w-md ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}>
                                    {!isMe && (
                                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {customerName.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex flex-col">
                                        {/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(msg.content?.trim()) ? (
                                            <a href={msg.content} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={msg.content}
                                                    alt="Shared image"
                                                    className="max-w-[220px] max-h-[200px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                                                />
                                            </a>
                                        ) : (
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm ${
                                                    isMe
                                                        ? "bg-orange-500 text-white rounded-br-xs"
                                                        : "bg-white text-gray-900 rounded-bl-xs border border-gray-200"
                                                }`}
                                            >
                                                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                                            </div>
                                        )}

                                        <div className={`flex items-center mt-1 space-x-1 ${isMe ? "justify-end mr-1" : "justify-start ml-1"}`}>
                                            <span className="text-[10px] text-gray-400">
                                                {moment(msg.createdAt).format("h:mm A")}
                                            </span>
                                            {isMe && <span className="text-[10px] text-gray-400 font-medium">· Admin</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-white px-6 py-3.5 border-t border-gray-200 shadow-xs">
                <div className="flex items-center space-x-3">
                    <input
                        name="content"
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Reply to ${customerName}...`}
                        disabled={isMessageLoading}
                        className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isMessageLoading || !content.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm text-sm"
                    >
                        <LuSend className="w-4 h-4" />
                        <span>Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
