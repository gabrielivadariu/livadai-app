import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { AuthContext } from "../context/AuthContext";

const getExperienceDate = (item) => item?.endsAt || item?.endDate || item?.startsAt || item?.startDate || null;

const getParticipantsCount = (item) => {
  if (typeof item?.bookedSpots === "number") return item.bookedSpots;
  if (typeof item?.maxParticipants === "number" && typeof item?.availableSpots === "number") {
    return Math.max(0, item.maxParticipants - item.availableSpots);
  }
  return 0;
};

export default function HostedExperiencesScreen({ route }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const hostIdParam = route?.params?.hostId;
  const hostId = typeof hostIdParam === "string" ? hostIdParam : hostIdParam?._id || user?._id;

  const load = useCallback(async () => {
    if (!hostId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/hosts/${hostId}/activities`);
      const now = Date.now();
      const filtered = (data || []).filter((item) => {
        const dateValue = getExperienceDate(item);
        if (!dateValue) return true;
        const ts = new Date(dateValue).getTime();
        return Number.isNaN(ts) ? true : ts <= now;
      });
      setItems(filtered);
    } catch (_e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => {
    const dateValue = getExperienceDate(item);
    const dateLabel = dateValue ? new Date(dateValue).toLocaleDateString() : "";
    const timeLabel = item?.startTime || (item?.startsAt ? new Date(item.startsAt).toLocaleTimeString().slice(0, 5) : "");
    const participants = getParticipantsCount(item);
    const statusLabel = participants === 0 ? t("hostedExperienceNoParticipants") : t("hostedExperienceCompleted");
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item?.title || t("hostedExperiences")}</Text>
        <Text style={styles.meta}>
          {dateLabel} {timeLabel}
        </Text>
        <Text style={styles.meta}>{item?.city || item?.address || ""}</Text>
        <Text style={styles.meta}>
          {t("participants")}: {participants}
        </Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>
    );
  };

  const emptyText = useMemo(() => (loading ? "" : t("noHostedExperiences")), [loading, t]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: livadaiColors.primaryText,
  },
  meta: {
    color: livadaiColors.secondaryText,
    marginTop: 4,
  },
  status: {
    marginTop: 6,
    fontWeight: "700",
    color: livadaiColors.primary,
  },
  empty: {
    marginTop: 16,
    color: livadaiColors.secondaryText,
  },
});
