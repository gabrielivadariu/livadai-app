import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function HostParticipantsScreen({ route, navigation }) {
  const { experienceId } = route.params;
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/bookings/host/experience/${experienceId}`);
      setBookings(data || []);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [experienceId]);

  const experience = bookings[0]?.experience || {};
  const bookedSeats = useMemo(() => bookings.reduce((sum, b) => sum + (b.quantity || 1), 0), [bookings]);
  const totalSeats =
    typeof experience?.maxParticipants === "number"
      ? experience.maxParticipants
      : typeof experience?.remainingSpots === "number"
        ? experience.remainingSpots + bookedSeats
        : bookedSeats;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
        <Text style={{ fontWeight: "800", color: "#0f172a", fontSize: 18 }}>{experience?.title || t("hostParticipantsTitle")}</Text>
        <Text style={{ color: "#475569", marginTop: 4 }}>{t("hostBookingsOccupied")}: {bookedSeats} / {totalSeats}</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>{t("hostParticipantsEmpty")}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" }}
            onPress={() => navigation.navigate("BookingDetailScreen", { bookingId: item._id })}
          >
            <Text style={{ fontWeight: "800", color: "#0f172a" }}>{item.explorer?.name || item.explorer?.email || "—"}</Text>
            <Text style={{ color: "#475569", marginTop: 4 }}>{t("spotsLabel")}: {item.quantity || 1}</Text>
            <Text style={{ color: "#475569", marginTop: 2 }}>{t("hostParticipantsStatus")}: {item.status || "—"}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
