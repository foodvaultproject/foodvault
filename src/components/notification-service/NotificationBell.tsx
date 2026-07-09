"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAffiliateInAppNotifications,
  getAffiliateUnreadNotificationCount,
  getPartnerInAppNotifications,
  getPartnerUnreadNotificationCount,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
} from "@/lib/notification-service/queries";
import type { InAppNotification } from "@/lib/notification-service/types";

type NotificationBellProps = {
  recipientType: "partner" | "affiliate";
  recipientId: string;
};

export function NotificationBell({ recipientType, recipientId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    const [items, count] = await Promise.all([
      recipientType === "partner"
        ? getPartnerInAppNotifications(recipientId)
        : getAffiliateInAppNotifications(recipientId),
      recipientType === "partner"
        ? getPartnerUnreadNotificationCount(recipientId)
        : getAffiliateUnreadNotificationCount(recipientId),
    ]);
    setNotifications(items);
    setUnreadCount(count);
  }

  useEffect(() => {
    void loadNotifications();
  }, [recipientId, recipientType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(notificationId: string) {
    await markInAppNotificationRead(notificationId);
    await loadNotifications();
  }

  async function handleMarkAllRead() {
    await markAllInAppNotificationsRead({
      recipientType,
      partnerId: recipientType === "partner" ? recipientId : undefined,
      affiliateId: recipientType === "affiliate" ? recipientId : undefined,
    });
    await loadNotifications();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen((current) => !current);
          void loadNotifications();
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-background text-foreground hover:bg-primary/5"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-foreground">Notifications</p>
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleMarkRead(item.id)}
                  className={`block w-full border-b border-border/70 px-4 py-3 text-left hover:bg-primary/5 ${
                    item.readAt ? "opacity-70" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("en-NZ")}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
