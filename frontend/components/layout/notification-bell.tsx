"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
} from "lucide-react";
import { useNotifications, Notification } from "@/lib/notification-context";
import notificationApi from "@/lib/notification-api";
import toast from "react-hot-toast";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await notificationApi.markAsRead(notification.id);
      markAsRead(notification.id);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await notificationApi.markAllAsRead();
      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationApi.delete(id);
      // Remove from UI (you'd typically have a removeNotification function)
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      setIsLoading(true);
      await notificationApi.deleteAll();
      clearAll();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "invoice":
        return <FileText size={16} className="text-blue-500" />;
      case "payment":
        return <DollarSign size={16} className="text-green-500" />;
      case "customer":
        return <AlertCircle size={16} className="text-purple-500" />;
      case "system":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} className="text-zinc-500" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "invoice":
        return "bg-blue-500/10 border-blue-500/20";
      case "payment":
        return "bg-green-500/10 border-green-500/20";
      case "customer":
        return "bg-purple-500/10 border-purple-500/20";
      case "system":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-zinc-800/50 border-zinc-700/50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors relative"
      >
        <Bell size={20} className="text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="text-xs text-blue-500 hover:text-blue-400 disabled:opacity-50"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={isLoading || notifications.length === 0}
                className="text-xs text-zinc-500 hover:text-zinc-400 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer border-l-4 ${
                      notification.isRead
                        ? "border-zinc-700"
                        : "border-blue-500"
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification);
                        }
                        if (notification.actionUrl) {
                          // Handle navigation if needed
                        }
                      }}
                      className="flex items-start gap-3"
                    >
                      {/* Icon */}
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-zinc-500 mt-2">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="text-zinc-600 hover:text-zinc-400 flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-zinc-800 text-center">
              <button className="text-xs text-blue-500 hover:text-blue-400">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
