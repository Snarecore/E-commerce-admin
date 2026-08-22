interface StepConfig {
    key: string;
    aliases: string[];
    label: string;
    icon: string;
}

const ORDER_STEPS: StepConfig[] = [
    { key: "Pending", aliases: ["pending", "order placed", "order_placed", "placed"], label: "Order Placed", icon: "📋" },
    { key: "Processing", aliases: ["processing", "in progress"], label: "Processing", icon: "⚙️" },
    { key: "Shipped", aliases: ["shipped", "on the way", "in transit"], label: "Shipped", icon: "🚚" },
    { key: "Delivered", aliases: ["delivered"], label: "Delivered", icon: "📦" },
    { key: "Completed", aliases: ["completed"], label: "Completed", icon: "✅" },
];

interface OrderStatusStepperProps {
    currentStatus: string;
}

const getStepIndex = (status: string) => {
    if (!status) return 0;
    const normalized = status.trim().toLowerCase();
    const index = ORDER_STEPS.findIndex(
        (step) =>
            step.key.toLowerCase() === normalized ||
            step.aliases.some((alias) => alias.toLowerCase() === normalized)
    );
    return index === -1 ? 0 : index;
};

const OrderStatusStepper = ({ currentStatus }: OrderStatusStepperProps) => {
    const isFailed = currentStatus?.trim().toLowerCase() === "failed";
    const isCompletedAll = currentStatus?.trim().toLowerCase() === "completed";
    const activeIndex = getStepIndex(currentStatus);

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
                        const isCompleted = isCompletedAll || index < activeIndex;
                        const isActive = !isCompletedAll && index === activeIndex;

                        return (
                            <div key={step.key} className="flex items-center flex-1 min-w-[90px]">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                                            isCompleted
                                                ? "bg-orange-500 border-orange-500 text-white shadow-md"
                                                : isActive
                                                ? "bg-white border-orange-500 text-orange-500 shadow-md ring-4 ring-orange-100 font-bold scale-105"
                                                : "bg-gray-100 border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        {isCompleted ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`text-[11px] text-center leading-tight whitespace-nowrap ${
                                            isCompleted
                                                ? "text-orange-600 font-semibold"
                                                : isActive
                                                ? "text-orange-600 font-bold"
                                                : "text-gray-400 font-medium"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < ORDER_STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                                            isCompletedAll || index < activeIndex ? "bg-orange-500" : "bg-gray-200"
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
