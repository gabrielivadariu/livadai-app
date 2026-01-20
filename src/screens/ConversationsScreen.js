import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";

export default function ConversationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [unreadByBooking, setUnreadByBooking] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const loadUnreadMessages = async () => {
    try {
      const { data } = await api.get("/notifications");
      const map = {};
      let total = 0;
      (data || []).forEach((n) => {
        if (n?.type !== "MESSAGE_NEW" || n?.isRead) return;
        const bookingId = n?.data?.bookingId;
        if (!bookingId) return;
        map[bookingId] = (map[bookingId] || 0) + 1;
        total += 1;
      });
      setUnreadByBooking(map);
      setUnreadTotal(total);
    } catch (_e) {
      setUnreadByBooking({});
      setUnreadTotal(0);
    }
  };

  const loadConversations = async () => {
    setError("");
    try {
      const { data } = await api.get("/messages");
      setItems(data);
      await loadUnreadMessages();
    } catch (e) {
      setError("Nu s-au putut încărca conversațiile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error)
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 8, backgroundColor: "#f4f6fb" }}>
        <Text style={{ padding: 16 }}>{error}</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, backgroundColor: "#f4f6fb" }}>
      <TouchableOpacity style={[styles.backButton, { top: insets.top + 6 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={livadaiColors.primary} />
      </TouchableOpacity>
      <FlatList
        data={items.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))}
        keyExtractor={(item) => item.bookingId}
        contentContainerStyle={[items.length ? undefined : styles.emptyContainer, styles.listContent]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadConversations();
            }}
          />
        }
        renderItem={({ item }) => {
          const dateText = item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString() : "";
          const otherName = item.otherUser?.name || t("someone");
          const experienceTitle = item.experienceTitle || t("experience");
          const avatar = item.otherUser?.avatar || item.otherUser?.profileImage;
          return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Chat", {
                bookingId: item.bookingId,
                experienceTitle: item.experienceTitle,
                otherUserName: item.otherUser?.name,
                otherUserId: item.otherUser?._id,
                otherUserAvatar: avatar,
              })
            }
            style={styles.card}
          >
              <View style={styles.avatarBox}>
                <Image
                  source={{ uri: avatar || "https://via.placeholder.com/80x80?text=User" }}
                  style={styles.avatar}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{otherName}</Text>
                    <Text style={styles.expTitle} numberOfLines={1}>{experienceTitle}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={styles.time}>{dateText}</Text>
                    {unreadByBooking[item.bookingId] ? (
                      <View style={styles.unreadPill}>
                        <Text style={styles.unreadPillText}>{unreadByBooking[item.bookingId]}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage || t("message")}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={36} color={livadaiColors.secondaryText} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Your conversations with hosts and explorers will appear here after a booking.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: 44, paddingBottom: 20 },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", paddingHorizontal: 24, gap: 8 },
  emptyTitle: { color: livadaiColors.secondaryText, fontSize: 16, fontWeight: "600" },
  emptySubtitle: { color: livadaiColors.secondaryText, fontSize: 13, textAlign: "center", lineHeight: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  avatarBox: { width: 48, height: 48, borderRadius: 24, overflow: "hidden", backgroundColor: "#e0f7fa" },
  avatar: { width: "100%", height: "100%" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "800", color: "#0f172a", flex: 1, marginRight: 8 },
  expTitle: { color: "#475569", fontSize: 13 },
  preview: { color: "#94a3b8", fontSize: 13 },
  time: { color: "#94a3b8", fontSize: 12 },
  unreadBadge: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  unreadPill: {
    minWidth: 18,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadPillText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  backButton: {
    position: "absolute",
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    zIndex: 10,
  },
});
