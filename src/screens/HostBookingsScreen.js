import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function HostBookingsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/bookings/host");
      setItems(data);
    } catch (e) {
      setError(t("hostBookingsLoadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startDate = (b) => {
    const start =
      b.experience?.startsAt || b.experience?.startDate || b.date || b.experience?.endDate || b.experience?.endsAt;
    return start ? new Date(start) : null;
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = startDate(a)?.getTime() || 0;
      const bDate = startDate(b)?.getTime() || 0;
      if (bDate !== aDate) return bDate - aDate;
      return 0;
    });
  }, [items]);

  const statusBadge = (b) => {
    if (b.status === "DISPUTED") return { text: t("disputedStatus"), bg: "#fee2e2", color: "#b91c1c" };
    if (b.status === "COMPLETED") return { text: t("bookingCompleted"), bg: "#dcfce7", color: "#166534" };
    if (b.status === "NO_SHOW") return { text: t("bookingNoShow"), bg: "#fee2e2", color: "#b91c1c" };
    if (["PAID", "DEPOSIT_PAID", "PENDING_ATTENDANCE"].includes(b.status))
      return { text: t("bookingActive"), bg: "#e0f2fe", color: "#075985" };
    return { text: t("bookingUpcoming"), bg: "#f1f5f9", color: "#475569" };
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

  return (
    <FlatList
      data={sortedItems}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      ListEmptyComponent={<Text style={{ padding: 16 }}>{t("hostBookingsEmpty")}</Text>}
      renderItem={({ item }) => {
        const badge = statusBadge(item);
        const sDate = startDate(item);
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("BookingDetailScreen", { bookingId: item._id })}
            style={{
              marginHorizontal: 12,
              marginBottom: 12,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontWeight: "800", color: "#0f172a", fontSize: 16 }} numberOfLines={2}>
                  {item.experience?.title}
                </Text>
                <Text style={{ color: "#475569", marginTop: 4 }} numberOfLines={1}>
                  {item.explorer?.name || item.explorer}
                </Text>
                <Text style={{ color: "#111827", fontWeight: "700", marginTop: 6 }}>
                  {sDate ? sDate.toLocaleString() : ""}
                </Text>
                <Text style={{ color: "#475569", marginTop: 2 }}>
                  {t("spotsLabel")}: {item.quantity || 1}
                </Text>
              </View>
              <View style={{ backgroundColor: badge.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: badge.color, fontWeight: "800" }}>{badge.text}</Text>
              </View>
            </View>
            <Text style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>{t("groupConfirmHint")}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
