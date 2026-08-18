import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 backdrop-blur-md z-50">
            <div className="flex flex-col items-center space-y-4">
                <AiOutlineLoading3Quarters className="text-blue-500 text-6xl animate-spin" />
                <p className="text-lg text-gray-600 font-medium">Loading, please wait...</p>
            </div>
        </div>
    );
};

export default Loading;