import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";

const historyStatuses = new Set(["COMPLETED", "CANCELLED", "REFUNDED"]);

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getExperienceEndDate = (exp) =>
  exp?.endDate || exp?.endsAt || exp?.date || exp?.startDate || exp?.startsAt || "";

const isCompletedVisible = (exp) => {
  const endDate = getExperienceEndDate(exp);
  if (!endDate) return true;
  const endMs = new Date(endDate).getTime();
  return Date.now() > endMs + 48 * 60 * 60 * 1000;
};

export default function GuestParticipationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/me");
      const meId = getId(user?._id);
      const ownParticipantBookings = (data || []).filter((b) => {
        const participantId = getId(b.explorer || b.user);
        return participantId && participantId === meId;
      });
      const next = [];
      const past = [];
      ownParticipantBookings.forEach((b) => {
        const exp = b.experience || {};
        if (historyStatuses.has(b.status)) {
          if (b.status !== "COMPLETED" || isCompletedVisible(exp)) {
            past.push(b);
          }
        } else {
          next.push(b);
        }
      });
      setUpcoming(next);
      setHistory(past);
    } catch (e) {
      setUpcoming([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderUpcoming = ({ item }) => {
    const exp = item.experience || {};
    const expId = getId(exp);
    const dateText = exp.startDate ? `${new Date(exp.startDate).toLocaleDateString()} ${exp.startTime || ""}` : "";
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (expId) {
            navigation.navigate("ExperienceDetail", { id: expId, bookingId: item._id });
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{exp.title || t("experience", { defaultValue: "Experience" })}</Text>
          {dateText ? <Text style={styles.meta}>{dateText}</Text> : null}
          {exp.address ? <Text style={styles.meta}>{exp.address}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistory = ({ item }) => {
    const exp = item.experience || {};
    const statusLabel = t(`status_${(item.status || "").toLowerCase()}`, { defaultValue: item.status });
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{exp.title || t("experience", { defaultValue: "Experience" })}</Text>
          <Text style={styles.meta}>{statusLabel}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(0, insets.top - 6) }]} edges={["top", "left", "right"]}>
      <AppHeader variant="simple" onNotifications={() => navigation.navigate("Notifications")} unread={0} />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "upcoming" && styles.tabBtnActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={[styles.tabText, tab === "upcoming" && styles.tabTextActive]}>
            {t("guestTabUpcoming")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "history" && styles.tabBtnActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            {t("guestTabHistory")}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "upcoming" ? (
        <FlatList
          data={[...upcoming].reverse()}
          keyExtractor={(item) => item._id}
          renderItem={renderUpcoming}
          ListEmptyComponent={<Text style={styles.empty}>{t("guestEmptyUpcoming")}</Text>}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      ) : (
        <FlatList
          data={[...history].reverse()}
          keyExtractor={(item) => item._id}
          renderItem={renderHistory}
          ListEmptyComponent={<Text style={styles.empty}>{t("guestEmptyHistory")}</Text>}
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
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontWeight: "800", color: livadaiColors.primaryText },
  meta: { color: livadaiColors.secondaryText, fontSize: 12, marginTop: 4 },
  empty: { color: livadaiColors.secondaryText, padding: 16, textAlign: "center" },
});
