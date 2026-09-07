import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiShoppingCart, FiX } from "react-icons/fi";
import { useAdminNotifications, AdminNotificationItem } from "../../hooks/useAdminNotifications";
import moment from "moment";

const timeAgo = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "just now";
  let m = moment(dateStr);
  if (!m.isValid()) {
    m = moment(new Date(dateStr));
  }
  if (!m.isValid()) return "just now";

  const diffSec = moment().diff(m, "seconds");
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return m.format("MMM D");
};

export const AdminNotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { items, unreadCount, markRead, markAllRead } = useAdminNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: AdminNotificationItem) => {
    if (!notif.isRead) {
      await markRead(notif.id);
    }
    setIsOpen(false);

    const targetOrderId = notif.orderId || notif.metadata?.orderNumber || (notif as any).order_id;

    if (targetOrderId) {
      const cleanOrderId = String(targetOrderId).replace(/^#/, "").trim();
      navigate(`/order-detail/${cleanOrderId}`);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-full transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
        title="Admin Notifications"
        aria-label="Admin Notifications"
      >
        <FiBell className="text-xl sm:text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1.5 flex items-center justify-center shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden text-gray-800 z-50 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--color-primary)]">
                Admin Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <FiCheck /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                <FiBell className="mx-auto text-3xl mb-2 text-gray-300" />
                No notifications yet
              </div>
            ) : (
              items.map((notif) => {
                const meta = notif.metadata || {};
                const orderNum = meta.orderNumber || notif.orderId || "";
                const customer = meta.customerName || "";
                const amount = meta.totalAmount ? `৳${meta.totalAmount.toLocaleString()}` : "";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.isRead ? "bg-[#FFF7F0]" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-2 bg-[#218DAE]/10 rounded-full text-[#218DAE] flex-shrink-0">
                      <FiShoppingCart className="text-base" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs sm:text-sm font-bold truncate ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}>
                          {notif.title || "🎉 New Order Placed"}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {orderNum ? `Order #${orderNum}` : ""} {customer ? `placed by ${customer}` : notif.message} {amount ? `(${amount})` : ""}
                      </p>

                      {meta.paymentMethod && (
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                          {meta.paymentMethod}
                        </span>
                      )}
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/orders");
              }}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              View All Orders →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
