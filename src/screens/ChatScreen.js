import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from "react-native";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationsContext } from "../context/NotificationsContext";

export default function ChatScreen({ route, navigation }) {
  const { bookingId, experienceTitle, otherUserName, otherUserId, otherUserAvatar } = route.params;
  const { user } = useContext(AuthContext);
  const { refreshUnread } = useContext(NotificationsContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [chatBlocked, setChatBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const listRef = useRef(null);

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${bookingId}`);
      const normalized = (data || []).map((m) => ({
        ...m,
        senderId: typeof m.sender === "object" ? m.sender._id || m.sender.id : m.sender || m.senderId,
      }));
      setMessages(normalized);
      setChatBlocked(false);
      setBlockMessage("");
    } catch (e) {
      if (e?.response?.status === 403) {
        setChatBlocked(true);
        setBlockMessage(e?.response?.data?.message || "Chat unavailable.");
      } else {
        setError("Nu s-au putut încărca mesajele");
      }
    } finally {
      setLoading(false);
    }
  };

  const markMessageNotificationsRead = async () => {
    try {
      const { data } = await api.get("/notifications");
      const ids = (data || [])
        .filter((n) => n?.type === "MESSAGE_NEW" && !n?.isRead && n?.data?.bookingId === bookingId)
        .map((n) => n._id);
      if (ids.length) {
        await api.post("/notifications/mark-read", { ids });
        refreshUnread?.();
      }
    } catch (_e) {
      // ignore
    }
  };

  useEffect(() => {
    loadMessages();
    markMessageNotificationsRead();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    if (listRef.current && messages.length) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || chatBlocked) return;
    const content = text.trim();
    setText("");
    try {
      const { data } = await api.post(`/messages/${bookingId}`, { message: content });
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          senderId: typeof data.sender === "object" ? data.sender._id || data.sender.id : data.sender || data.senderId,
        },
      ]);
    } catch (e) {
      if (e?.response?.status === 403) {
        setChatBlocked(true);
        setBlockMessage(e?.response?.data?.message || "Chat unavailable.");
      } else {
        setError("Nu s-a putut trimite mesajul");
      }
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          activeOpacity={0.8}
          onPress={() => {
            if (otherUserId) navigation.navigate("PublicProfile", { userId: otherUserId });
          }}
        >
          <View style={styles.headerAvatar}>
            {otherUserAvatar ? (
              <Image source={{ uri: otherUserAvatar }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Ionicons name="person" size={22} color="#fff" />
            )}
          </View>
          <View>
            <Text style={styles.headerName}>{otherUserName || t("someone")}</Text>
            {experienceTitle ? <Text style={styles.headerSub}>{experienceTitle}</Text> : null}
          </View>
        </TouchableOpacity>
      </View>

      {blockMessage ? (
        <Text style={{ color: "red", marginHorizontal: 12, marginTop: 8 }}>{blockMessage}</Text>
      ) : null}
      {error ? <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text> : null}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const meId = user?._id || user?.id;
          const isMe = item.senderId === meId;
          const avatar = !isMe ? item.senderProfile?.profileImage || otherUserAvatar : null;
          return (
            <View style={[styles.msgRow, isMe ? styles.meRow : styles.otherRow]}>
              {!isMe && avatar ? <Image source={{ uri: avatar }} style={styles.msgAvatar} /> : <View style={{ width: 32 }} />}
              <View style={[styles.bubble, isMe ? styles.meBubble : styles.otherBubble]}>
                <Text style={{ color: isMe ? "#fff" : "#000" }}>{item.message}</Text>
                <Text style={{ color: isMe ? "#f0f0f0" : "#555", fontSize: 10 }}>
                  {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}
        onContentSizeChange={() => {
          if (listRef.current) listRef.current.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          if (listRef.current) listRef.current.scrollToEnd({ animated: true });
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          placeholder={t("chatPlaceholder")}
          value={text}
          onChangeText={setText}
          style={styles.input}
          editable={!chatBlocked}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={chatBlocked}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontWeight: "800", color: "#0f172a" },
  headerSub: { color: "#475569", fontSize: 12 },
  msgRow: {
    flexDirection: "row",
    marginVertical: 6,
  },
  meRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  meBubble: {
    backgroundColor: livadaiColors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6, backgroundColor: "#e2e8f0" },
});
