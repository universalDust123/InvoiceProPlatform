"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import notificationApi from "@/lib/notification-api";
import { useAuthContext } from "@/lib/auth-context";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "invoice" | "payment" | "customer" | "system";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  clearAll: () => void;

  // NEW:
  // Allow manual refresh of notifications
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  // NEW:
  // Get authenticated user from auth context
  // We use this to detect login/logout/account switching
  const { user, isAuthenticated } = useAuthContext();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // NEW:
  // Loading state for notification fetching
  const [loading, setLoading] = useState(false);

  // NEW:
  // Fetch notifications from backend API
  const refreshNotifications = useCallback(async () => {

    // IMPORTANT:
    // If user is not authenticated,
    // clear notifications immediately
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      const response = await notificationApi.list();

      console.log("Notifications API:", response.data);

      // Handle array response
      if (Array.isArray(response.data)) {
        setNotifications(response.data);

      // Handle paginated response
      } else if (response.data?.content) {
        setNotifications(response.data.content);

      // Fallback
      } else {
        setNotifications([]);
      }

    } catch (error) {

      console.error("Failed to fetch notifications", error);

      // IMPORTANT:
      // Prevent old notifications from staying in UI
      setNotifications([]);

    } finally {

      // Stop loading spinner
      setLoading(false);
    }

  }, [isAuthenticated]);

  // IMPORTANT FIX:
  // Refetch notifications whenever user changes
  //
  // BEFORE:
  // Notifications only fetched once on app load.
  //
  // PROBLEM:
  // User A notifications remained visible after
  // User B logged in.
  //
  // NOW:
  // Notifications automatically refresh whenever:
  // - user logs in
  // - user logs out
  // - account switches
  useEffect(() => {

    // If authenticated user exists
    if (user?.id) {

      // Fetch that user's notifications
      refreshNotifications();

    } else {

      // IMPORTANT:
      // Clear notifications on logout
      // Prevents cross-user notification leakage
      setNotifications([]);
    }

  }, [user?.id, refreshNotifications]);

  // Calculate unread notifications count
  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  // Add new notification to top
  const addNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [
        notification,
        ...prev,
      ]);
    },
    []
  );

  // Remove notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true }
          : n
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,

        addNotification,
        removeNotification,

        markAsRead,
        markAllAsRead,

        clearAll,

        // NEW:
        // Expose refresh function
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {

  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
}