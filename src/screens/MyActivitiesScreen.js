import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import AppHeader from "../components/AppHeader";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const getExperienceEndDate = (exp) => {
  if (!exp) return null;
  if (exp.endsAt || exp.endDate) return new Date(exp.endsAt || exp.endDate);
  if (exp.startDate && exp.durationMinutes) {
    const start = new Date(exp.startDate);
    return new Date(start.getTime() + Number(exp.durationMinutes) * 60 * 1000);
  }
  if (exp.startsAt && exp.durationMinutes) {
    const start = new Date(exp.startsAt);
    return new Date(start.getTime() + Number(exp.durationMinutes) * 60 * 1000);
  }
  if (exp.startDate) {
    const start = new Date(exp.startDate);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }
  if (exp.startsAt) {
    const start = new Date(exp.startsAt);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }
  return null;
};

const isReviewEligible = (exp, status) => {
  if (status !== "COMPLETED") return false;
  const endDate = getExperienceEndDate(exp);
  if (!endDate || Number.isNaN(endDate.getTime())) return false;
  return Date.now() > endDate.getTime() + 48 * 60 * 60 * 1000;
};

const chatAllowedStatuses = new Set(["PAID", "COMPLETED", "DEPOSIT_PAID"]);
const hostHistoryStatuses = new Set(["COMPLETED", "CANCELLED", "REFUNDED"]);
const explorerHistoryStatuses = new Set(["COMPLETED", "CANCELLED", "REFUNDED"]);

export default function MyActivitiesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const isHost = user?.role === "HOST";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/me");
      const up = [];
      const past = [];
      data.forEach((b) => {
        const exp = b.experience || {};
        const record = {
          id: b._id,
          experience: exp,
          status: b.status,
          quantity: b.quantity || 1,
          host: isHost ? b.explorer : b.host,
        };
        if (isHost) {
          if (hostHistoryStatuses.has(b.status)) past.push(record);
          else up.push(record);
        } else {
          if (explorerHistoryStatuses.has(b.status)) past.push(record);
          else up.push(record);
        }
      });
      setUpcoming(up);
      setHistory(past);
    } catch (e) {
      setUpcoming([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [isHost]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = ({ item }) => {
    const exp = item.experience || {};
    const expId = typeof exp === "string" ? exp : exp?._id || exp?.id;
    const dateText = exp.startDate
      ? `${new Date(exp.startDate).toLocaleDateString()} ${exp.startTime || ""}`
      : "";
    const seats =
      exp.activityType === "GROUP" && exp.maxParticipants
        ? `Locuri rezervate: ${item.quantity || 1} / ${exp.maxParticipants}`
        : exp.activityType === "INDIVIDUAL"
          ? "Loc unic"
          : "";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (expId) {
            navigation.navigate("ExperienceDetail", { id: expId, bookingId: item.id });
          }
        }}
      >
        {exp.mainImageUrl ? <Image source={{ uri: exp.mainImageUrl }} style={styles.thumb} /> : null}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{exp.title}</Text>
          <Text style={styles.subtitle}>
            {exp.price} {exp.currencyCode || "EUR"} • {exp.activityType || ""}
          </Text>
          {dateText ? <Text style={styles.subtitle}>{dateText}</Text> : null}
          {exp.address ? <Text style={styles.subtitle}>{exp.address}</Text> : null}
          {seats ? <Text style={styles.subtitle}>{seats}</Text> : null}
          <Text style={styles.status}>{t(`status_${(item.status || "").toLowerCase()}`, { defaultValue: item.status })}</Text>
          {chatAllowedStatuses.has(item.status) ? (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                navigation.navigate("Chat", {
                  bookingId: item.id,
                  experienceTitle: exp.title,
                  otherUserName: item.host?.name,
                  otherUserId: item.host?._id || item.host,
                  otherUserAvatar: item.host?.avatar,
                })
              }
            >
              <Text style={styles.chatBtnText}>{t("messageHost")}</Text>
            </TouchableOpacity>
          ) : null}
          {isReviewEligible(exp, item.status) ? (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() =>
                navigation.navigate("Review", {
                  bookingId: item.id,
                  hostId: item.host?._id || item.host,
                  experienceId: expId,
                  experienceTitle: exp.title,
                })
              }
            >
              <Text style={styles.reviewBtnText}>{t("leaveReview")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(0, insets.top - 6) }]} edges={["top", "left", "right"]}>
      <AppHeader
        variant="simple"
        onNotifications={() => navigation.navigate("Notifications")}
        unread={0}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "upcoming" && styles.tabBtnActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={[styles.tabText, tab === "upcoming" && styles.tabTextActive]}>{t("tabUpcoming")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "history" && styles.tabBtnActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>{t("tabHistory")}</Text>
        </TouchableOpacity>
      </View>

      {tab === "upcoming" ? (
        <FlatList
          data={[...upcoming].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>{t("noUpcoming")}</Text>}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      ) : (
        <FlatList
          data={[...history].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>{t("noPast")}</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb", paddingHorizontal: 12 },
  tabs: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#fff",
  },
  tabText: { color: "#334155", fontWeight: "700" },
  tabTextActive: { color: livadaiColors.primary },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  title: { fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#6b7280", fontSize: 12 },
  status: { color: livadaiColors.accent, fontWeight: "700", marginTop: 4 },
  chatBtn: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: livadaiColors.primary,
    alignSelf: "flex-start",
  },
  chatBtnText: { color: "#fff", fontWeight: "700" },
  reviewBtn: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: livadaiColors.primary,
    alignSelf: "flex-start",
  },
  reviewBtnText: { color: livadaiColors.primary, fontWeight: "700" },
  empty: { color: "#6b7280", textAlign: "center", paddingVertical: 6 },
});
