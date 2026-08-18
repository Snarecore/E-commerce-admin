import { useEffect, useState } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import avatar from "/images/avatar.png"
import { userAtom } from "../../../store/user-store";
import { useAtomValue } from "jotai";

interface User {
    id: string;
    name: string;
    phone: string;
    bgColor?: string;
    participantOne?: {
        id: string;
        name?: string;
        phone?: string;
    };
    participantTwo?: {
        name?: string;
        phone?: string;
    };
}

const ChatSidebar = ({ setSelectedUser, selectedUser }: any) => {
    const { fetchData } = useAPI();
    const [participant, setPerticipant] = useState<User[]>([]);
    const userData = useAtomValue(userAtom);

    useEffect(() => {
        const getConversationUsers = async () => {
            const response = await fetchData({ apiUrl: `${apiConfig.messageLinks.conversationUrl}` });
            setPerticipant(response);
        }
        getConversationUsers();
    }, [])

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3.5 border-b border-gray-200">
                <p className="text-xl font-bold text-gray-900">Chats</p>
            </div>

            <div className="flex-1 p-2">
                <div className="space-y-2">
                    {participant?.map((user: User) => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 rounded-lg ${selectedUser?.id === user.id
                                ? "bg-orange-50 border-r-2 border-orange-500"
                                : ""
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full mr-3 overflow-hidden relative">
                                <img
                                    src={avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.className = `w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${user.bgColor}`;
                                            parent.textContent = user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("");
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">
                                    {
                                        user.participantOne?.id === userData?.id ? user.participantTwo?.name : user.participantOne?.name
                                    }
                                </p>
                                <p className="text-sm text-gray-700">{user.participantOne?.id === userData?.id ? user.participantTwo?.phone : user.participantOne?.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
