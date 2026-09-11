import { useState, useEffect, useRef, useCallback } from "react";
import { getData, patchData } from "../services/api-service";

export interface AdminNotificationMetadata {
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  currency?: string;
  paymentMethod?: string;
}

export interface AdminNotificationItem {
  id: string;
  _id?: string;
  type: string;
  orderId?: string;
  role: string;
  isRead: boolean;
  title: string;
  message: string;
  metadata?: AdminNotificationMetadata;
  createdAt: string;
}

interface ApiResponsePayload {
  items?: AdminNotificationItem[];
  unreadCount?: number;
  nextCursor?: string | null;
}

export function playChimeSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

import { useSocket } from "./useSocket";
import { SocketEvent } from "../types/socket.types";

export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { socket } = useSocket();
  
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  const fetchAdminNotifications = useCallback(async () => {
    try {
      const res: any = await getData({ url: "site/notifications/admin?limit=20" });
      if (res && !res.error) {
        const payload: ApiResponsePayload = res.data || res;
        const fetchedItems: AdminNotificationItem[] = payload.items || [];
        const fetchedUnreadCount: number = payload.unreadCount ?? fetchedItems.filter((i) => !i.isRead).length;

        // Detect new notifications for sound alert
        if (!isInitialLoadRef.current && document.visibilityState === "visible") {
          const hasBrandNewUnread = fetchedItems.some(
            (item) => !item.isRead && !knownIdsRef.current.has(item.id || item._id || "")
          );
          if (hasBrandNewUnread) {
            playChimeSound();
          }
        }

        // Update known IDs
        fetchedItems.forEach((item) => {
          const key = item.id || item._id;
          if (key) knownIdsRef.current.add(key);
        });
        isInitialLoadRef.current = false;

        setItems(fetchedItems);
        setUnreadCount(fetchedUnreadCount);
      }
    } catch {
      // Error fetching admin notifications
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load once on mount
  useEffect(() => {
    fetchAdminNotifications();
  }, [fetchAdminNotifications]);

  // Real-time notification updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleAdminNotification = () => {
      fetchAdminNotifications();
      playChimeSound();
    };

    const handleOrderCreated = () => {
      fetchAdminNotifications();
    };

    socket.on(SocketEvent.ADMIN_NOTIFICATION, handleAdminNotification);
    socket.on(SocketEvent.ORDER_CREATED, handleOrderCreated);

    return () => {
      socket.off(SocketEvent.ADMIN_NOTIFICATION, handleAdminNotification);
      socket.off(SocketEvent.ORDER_CREATED, handleOrderCreated);
    };
  }, [socket, fetchAdminNotifications]);

  // BroadcastChannel Signal Listener (Admin Tabs Sync Only)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("fashion_time_admin_notifications");
        channel.onmessage = (event) => {
          if (event.data?.type === "NEW_ADMIN_NOTIF_AVAILABLE") {
            fetchAdminNotifications();
          }
        };
      } catch {}
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [fetchAdminNotifications]);

  // Optimistic Mark as Read
  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => ((item.id === id || item._id === id) ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await patchData({ url: `site/notifications/admin/${id}/read`, body: {} });
      // Notify other Admin tabs via signal
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("fashion_time_admin_notifications");
          bc.postMessage({ type: "NEW_ADMIN_NOTIF_AVAILABLE" });
          bc.close();
        } catch {}
      }
    } catch {}
  };

  // Optimistic Mark All as Read
  const markAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await patchData({ url: "site/notifications/admin/read-all", body: {} });
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("fashion_time_admin_notifications");
          bc.postMessage({ type: "NEW_ADMIN_NOTIF_AVAILABLE" });
          bc.close();
        } catch {}
      }
    } catch {}
  };

  return {
    items,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    refetch: fetchAdminNotifications
  };
}
