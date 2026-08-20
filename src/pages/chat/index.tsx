import { useState } from "react";
import PageHeader from "../../components/cards/PageHeader";
import ChatSidebar, { ConversationItem } from "./component/ChatSidebar";
import ChatWindow from "./component/ChatWindow";

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState<ConversationItem | null>(null);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap">
                <PageHeader
                    headerTitle="Customer Support Inbox"
                    headerDescription="View and reply to customer messages in real-time"
                />
            </div>

            <div className="flex gap-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden h-[760px]">
                <div className="w-[340px] h-full overflow-hidden">
                    <ChatSidebar setSelectedUser={setSelectedUser} selectedUser={selectedUser} />
                </div>

                <div className="flex-1 bg-gray-50 h-full overflow-hidden">
                    {selectedUser ? (
                        <ChatWindow selectedUser={selectedUser} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl font-bold">
                                💬
                            </div>
                            <p className="font-semibold text-gray-700">No conversation selected</p>
                            <p className="text-sm text-gray-400">Select a customer from the left sidebar to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
