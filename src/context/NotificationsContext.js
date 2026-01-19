import React, { createContext, useCallback, useEffect, useState } from "react";
import api from "../services/api";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data?.count || 0);
    } catch (_e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, setUnreadCount, refreshUnread }}>
      {children}
    </NotificationsContext.Provider>
  );
};
