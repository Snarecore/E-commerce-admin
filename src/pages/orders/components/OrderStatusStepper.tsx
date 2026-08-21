interface StepConfig {
    key: string;
    label: string;
    icon: string;
}

const ORDER_STEPS: StepConfig[] = [
    { key: "Pending", label: "Order Placed", icon: "📋" },
    { key: "Processing", label: "Processing", icon: "⚙️" },
    { key: "Shipped", label: "Shipped", icon: "🚚" },
    { key: "Delivered", label: "Delivered", icon: "📦" },
    { key: "Completed", label: "Completed", icon: "✅" },
];

interface OrderStatusStepperProps {
    currentStatus: string;
}

const OrderStatusStepper = ({ currentStatus }: OrderStatusStepperProps) => {
    const isFailed = currentStatus === "Failed";
    const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
    const activeIndex = currentIndex === -1 ? ORDER_STEPS.length - 1 : currentIndex;

    return (
        <div className="w-full py-4">
            {isFailed ? (
                <div className="flex items-center justify-center gap-3 bg-red-50 border border-red-200 rounded-lg px-6 py-4">
                    <span className="text-2xl">❌</span>
                    <div>
                        <p className="font-semibold text-red-700 text-base">Order Failed</p>
                        <p className="text-sm text-red-500 mt-0.5">
                            This order was not completed due to a payment or processing issue.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center w-full overflow-x-auto pb-2">
                    {ORDER_STEPS.map((step, index) => {
                        const isCompleted = index < activeIndex;
                        const isActive = index === activeIndex;

                        return (
                            <div key={step.key} className="flex items-center flex-1 min-w-[80px]">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                                            isCompleted
                                                ? "bg-orange-500 border-orange-500 text-white shadow-md"
                                                : isActive
                                                ? "bg-white border-orange-500 text-orange-500 shadow-md ring-2 ring-orange-200"
                                                : "bg-gray-100 border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        {isCompleted ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`text-[11px] font-medium text-center leading-tight whitespace-nowrap ${
                                            isCompleted || isActive ? "text-orange-600" : "text-gray-400"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < ORDER_STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                                            isCompleted ? "bg-orange-500" : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderStatusStepper;
