import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";
import { NotificationsContext } from "../context/NotificationsContext";
import ScreenHeader from "../components/ScreenHeader";

const typeIcon = {
  BOOKING_CONFIRMED: "ticket-outline",
  BOOKING_RECEIVED: "person-outline",
  BOOKING_CANCELLED: "alert-circle-outline",
  EVENT_REMINDER_HOST: "alarm-outline",
  EVENT_REMINDER_EXPLORER: "alarm-outline",
  MESSAGE_NEW: "chatbubble-ellipses-outline",
};

const formatTimeAgo = (date) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { t } = useTranslation();
  const { setUnreadCount, refreshUnread } = useContext(NotificationsContext);

  const formatNotificationText = (item) => {
    const name = item.data?.bookedBy || t("someone");
    const title = item.data?.activityTitle || t("experience");
    const spots = item.data?.spots || 1;
    const senderName = item.data?.senderName || t("someone");

    switch (item.type) {
      case "BOOKING_RECEIVED":
        return {
          title: t("notif_booking_received_title"),
          message: t("notif_booking_received_msg", { name, spots, title }),
        };
      case "BOOKING_CONFIRMED":
        return {
          title: t("notif_booking_confirmed_title"),
          message: t("notif_booking_confirmed_msg", { title }),
        };
      case "BOOKING_CANCELLED":
        return {
          title: t("notif_booking_cancelled_title"),
          message: t("notif_booking_cancelled_msg", { title }),
        };
      case "EVENT_REMINDER_HOST":
        return {
          title: t("notif_event_reminder_host_title"),
          message: t("notif_event_reminder_host_msg", { title }),
        };
      case "EVENT_REMINDER_EXPLORER":
        return {
          title: t("notif_event_reminder_explorer_title"),
          message: t("notif_event_reminder_explorer_msg", { title }),
        };
      case "MESSAGE_NEW":
        return {
          title: t("notif_message_new_title"),
          message: t("notif_message_new_msg", { sender: senderName, title }),
        };
      default:
        return { title: item.title, message: item.message };
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      const arr = data || [];
      setItems(arr);
      const unread = arr.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (_e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    const interval = setInterval(refreshUnread, 30000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [navigation, refreshUnread]);

  const onPressItem = async (item) => {
    if (!item.isRead && !marking) {
      setMarking(true);
      await api.post("/notifications/mark-read", { ids: [item._id] });
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      setMarking(false);
    }
    const data = item.data || {};
    // Deep links simple: prefer chat for messages, otherwise experience detail
    if (item.type === "MESSAGE_NEW" && data.bookingId) {
      navigation.navigate("Chat", {
        bookingId: data.bookingId,
        experienceTitle: data.activityTitle,
        otherUserName: data.senderName,
        otherUserId: data.senderId,
        otherUserAvatar: data.senderAvatar,
      });
      return;
    }
    if (data.activityId) {
      navigation.navigate("ExperienceDetail", { id: data.activityId, screen: "ExperienceDetail" });
      return;
    }
    if (data.bookingId) {
      navigation.navigate("Booking", { bookingId: data.bookingId });
    }
  };

  const renderItem = ({ item }) => {
    const icon = typeIcon[item.type] || "notifications-outline";
    const formatted = formatNotificationText(item);
    return (
      <TouchableOpacity style={[styles.card, !item.isRead && styles.unread]} onPress={() => onPressItem(item)}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color="#0f172a" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{formatted.title}</Text>
          <Text style={styles.message}>{formatted.message}</Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t("notifications")} onBack={() => navigation.goBack()} />
        <ActivityIndicator style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("notifications")} onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>{t("notifications_empty", { defaultValue: "No notifications yet." })}</Text>}
        ListHeaderComponent={
          items.length ? (
            <TouchableOpacity
              style={styles.markAll}
              onPress={async () => {
                await api.post("/notifications/mark-all-read");
                setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
              }}
            >
              <Text style={styles.markAllText}>{t("mark_all_read", { defaultValue: "Mark all as read" })}</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", paddingHorizontal: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  unread: { borderColor: livadaiColors.primary },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    justifyContent: "center",
  },
  markAll: { alignSelf: "flex-end", marginBottom: 8, padding: 4 },
  markAllText: { color: livadaiColors.primary, fontWeight: "700" },
  title: { fontWeight: "800", color: "#0f172a" },
  message: { color: "#475569", marginTop: 2 },
  time: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});
