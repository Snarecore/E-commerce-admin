import { useEffect, useState } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import avatar from "/images/avatar.png";
import moment from "moment";

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface ConversationItem {
    id: string;
    customerId: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCountAdmin: number;
    customer?: Customer | null;
}

interface ChatSidebarProps {
    setSelectedUser: (user: ConversationItem | null) => void;
    selectedUser: ConversationItem | null;
    autoSelectCustomerId?: string;
}

const ChatSidebar = ({ setSelectedUser, selectedUser, autoSelectCustomerId }: ChatSidebarProps) => {
    const { fetchData } = useAPI();
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const getConversations = async () => {
        try {
            const response = await fetchData({
                apiUrl: `${apiConfig.messageLinks.conversationUrl}?page=1&limit=50`
            });

            let items: ConversationItem[] = [];
            if (Array.isArray(response)) {
                items = response;
            } else if (Array.isArray(response?.data)) {
                items = response.data;
            } else if (Array.isArray(response?.data?.data)) {
                items = response.data.data;
            }

            setConversations(items);

            if (autoSelectCustomerId && items.length > 0) {
                const target = items.find(
                    (c) => c.customerId === autoSelectCustomerId || c.customer?.id === autoSelectCustomerId
                );
                if (target) {
                    setSelectedUser(target);
                }
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getConversations().finally(() => setIsLoading(false));

        // Auto-refresh conversations every 4 seconds for live inbox experience
        const interval = setInterval(getConversations, 4000);
        return () => clearInterval(interval);
    }, [autoSelectCustomerId]);

    const filteredConversations = conversations.filter((convo) => {
        const name = convo.customer?.name?.toLowerCase() || "";
        const email = convo.customer?.email?.toLowerCase() || "";
        const phone = convo.customer?.phone?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query) || phone.includes(query);
    });

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-gray-900">Customer Messages</p>
                    <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                        {conversations.length}
                    </span>
                </div>
                <input
                    type="text"
                    placeholder="Search by customer name/email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
            </div>

            <div className="flex-1 p-2 overflow-y-auto">
                {isLoading && conversations.length === 0 ? (
                    <div className="flex items-center justify-center p-6 text-sm text-gray-400">
                        Loading conversations...
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center p-6 text-sm text-gray-400 text-center">
                        No customer conversations found.
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {filteredConversations.map((convo: ConversationItem) => {
                            const isSelected = selectedUser?.id === convo.id;
                            const customerName = convo.customer?.name || `Customer #${convo.customerId.slice(0, 6)}`;
                            const customerEmail = convo.customer?.email || "";
                            const hasUnread = convo.unreadCountAdmin > 0;

                            return (
                                <div
                                    key={convo.id}
                                    onClick={() => setSelectedUser(convo)}
                                    className={`flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-all duration-150 rounded-lg border ${
                                        isSelected
                                            ? "bg-orange-50/80 border-orange-400 shadow-sm"
                                            : "border-transparent"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full mr-3 shrink-0 overflow-hidden bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                        <img
                                            src={avatar}
                                            alt={customerName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = "none";
                                            }}
                                        />
                                        <span className="hidden">
                                            {customerName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate ${hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                                                {customerName}
                                            </p>
                                            {convo.lastMessageAt && (
                                                <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                                                    {moment(convo.lastMessageAt).isValid() ? moment(convo.lastMessageAt).fromNow(true) : ''}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {convo.lastMessage || customerEmail || "No messages yet"}
                                        </p>
                                    </div>

                                    {hasUnread && (
                                        <span className="ml-2 shrink-0 bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs animate-pulse">
                                            {convo.unreadCountAdmin}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
