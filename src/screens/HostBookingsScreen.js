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

  const groupedItems = useMemo(() => {
    const map = {};
    items.forEach((booking) => {
      const exp = booking.experience || {};
      const expId = exp._id || "unknown";
      if (!map[expId]) {
        map[expId] = { experience: exp, bookings: [] };
      }
      map[expId].bookings.push(booking);
    });
    return Object.values(map).sort((a, b) => {
      const aDate = startDate({ experience: a.experience })?.getTime() || 0;
      const bDate = startDate({ experience: b.experience })?.getTime() || 0;
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
      data={groupedItems}
      keyExtractor={(item) => item.experience?._id || item.experience?.id || String(item.experience?.title || Math.random())}
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
        const exp = item.experience || {};
        const sDate = startDate({ experience: exp });
        const bookedSeats = (item.bookings || []).reduce((sum, b) => sum + (b.quantity || 1), 0);
        const totalSeats =
          typeof exp.maxParticipants === "number"
            ? exp.maxParticipants
            : typeof exp.remainingSpots === "number"
              ? exp.remainingSpots + bookedSeats
              : bookedSeats;
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("HostParticipants", { experienceId: exp._id })}
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
                  {exp.title}
                </Text>
                <Text style={{ color: "#111827", fontWeight: "700", marginTop: 6 }}>
                  {sDate ? sDate.toLocaleString() : ""}
                </Text>
                <Text style={{ color: "#475569", marginTop: 2 }}>
                  {t("hostBookingsOccupied")}: {bookedSeats} / {totalSeats}
                </Text>
              </View>
              <View style={{ backgroundColor: "#e0f2fe", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: "#075985", fontWeight: "800" }}>{t("bookingActive")}</Text>
              </View>
            </View>
            <Text style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>{t("hostBookingsParticipantsHint")}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
