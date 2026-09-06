import { useState, useEffect, useRef, useCallback } from "react";
import { getData, patchData } from "../services/api-service";
import { getStoredToken } from "../utils/auth-storage";

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

export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);
  const backoffDelayRef = useRef<number>(5000);

  const fetchAdminNotifications = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await getData({ url: "site/notifications/admin?limit=20" });
      if (res && !res.error) {
        const payload: ApiResponsePayload = res.data || res;
        const fetchedItems: AdminNotificationItem[] = payload.items || [];
        const fetchedUnreadCount: number = payload.unreadCount ?? fetchedItems.filter((i) => !i.isRead).length;

        // Detect new notifications for sound alert
        if (!isInitialLoadRef.current && document.visibilityState === "visible") {
          const hasBrandNewUnread = fetchedItems.some(
            (item) => !item.isRead && !knownIdsRef.current.has(item.id)
          );
          if (hasBrandNewUnread) {
            playChimeSound();
          }
        }

        // Update known IDs
        fetchedItems.forEach((item) => knownIdsRef.current.add(item.id));
        isInitialLoadRef.current = false;

        setItems(fetchedItems);
        setUnreadCount(fetchedUnreadCount);
        backoffDelayRef.current = 5000; // Reset backoff on success
      }
    } catch {
      // Exponential backoff up to 60s on fetch error
      backoffDelayRef.current = Math.min(backoffDelayRef.current * 2, 60000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Smart Polling Engine (Visibility API + Online/Offline + BroadcastChannel Signal)
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const schedulePoll = () => {
      clearTimeout(timerId);
      const isVisible = document.visibilityState === "visible";
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

      if (!isOnline) return; // Pause polling when offline

      const interval = isVisible ? backoffDelayRef.current : 60000; // 5s active, 60s when hidden

      timerId = setTimeout(async () => {
        await fetchAdminNotifications();
        schedulePoll();
      }, interval);
    };

    fetchAdminNotifications().then(schedulePoll);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        backoffDelayRef.current = 5000;
        fetchAdminNotifications().then(schedulePoll);
      }
    };

    const handleOnline = () => {
      backoffDelayRef.current = 5000;
      fetchAdminNotifications().then(schedulePoll);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    // BroadcastChannel Signal Listener (Admin Tabs Sync Only)
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
      clearTimeout(timerId);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      if (channel) {
        channel.close();
      }
    };
  }, [fetchAdminNotifications]);

  // Optimistic Mark as Read
  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await patchData({ url: `site/notifications/admin/${id}/read` });
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
      await patchData({ url: "site/notifications/admin/read-all" });
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
