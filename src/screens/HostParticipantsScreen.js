import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { livadaiColors } from "../theme/theme";

const statusAllowsActions = new Set(["PAID", "DEPOSIT_PAID", "PENDING_ATTENDANCE"]);

const getDateWindow = (experience) => {
  const start =
    experience?.startsAt || experience?.startDate || experience?.date || experience?.endDate || experience?.endsAt;
  const end =
    experience?.endsAt || experience?.endDate || experience?.date || experience?.startDate || experience?.startsAt;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const windowStart = new Date(startDate.getTime() + 15 * 60 * 1000);
  const windowEnd = new Date(endDate.getTime() + 48 * 60 * 60 * 1000);
  return { startDate, endDate, windowStart, windowEnd };
};

export default function HostParticipantsScreen({ route }) {
  const { experienceId } = route.params;
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

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
  const dateWindow = getDateWindow(experience);
  const now = new Date();
  const canMarkAttendance = dateWindow ? now >= dateWindow.windowStart && now <= dateWindow.windowEnd : false;
  const canGlobalNoShow =
    canMarkAttendance &&
    bookings.length > 0 &&
    bookings.every((b) => statusAllowsActions.has(b.status));

  const confirmAttendance = (bookingId) => {
    Alert.alert(
      t("confirmAttendanceTitle"),
      t("confirmAttendanceMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirmAttendanceConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingId(bookingId);
              await api.post(`/bookings/${bookingId}/confirm-attendance`);
              await load();
            } catch (e) {
              Alert.alert("", e?.response?.data?.message || t("hostBookingConfirmFailed"));
            } finally {
              setSavingId(null);
            }
          },
        },
      ]
    );
  };

  const cancelParticipation = (bookingId) => {
    Alert.alert(
      t("hostParticipantsCancelTitle"),
      t("hostParticipantsCancelMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("hostParticipantsCancelConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingId(bookingId);
              await api.post(`/bookings/${bookingId}/cancel-by-host`);
              await load();
            } catch (e) {
              Alert.alert("", e?.response?.data?.message || t("hostBookingCancelFailed"));
            } finally {
              setSavingId(null);
            }
          },
        },
      ]
    );
  };

  const markNoShowAll = () => {
    Alert.alert(
      t("hostParticipantsNoShowTitle"),
      t("hostParticipantsNoShowMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("hostParticipantsNoShowConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingId("all");
              for (const b of bookings) {
                if (statusAllowsActions.has(b.status)) {
                  await api.post(`/bookings/${b._id}/no-show`);
                }
              }
              await load();
            } catch (e) {
              Alert.alert("", e?.response?.data?.message || t("hostBookingNoShowFailed"));
            } finally {
              setSavingId(null);
            }
          },
        },
      ]
    );
  };

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
        {canGlobalNoShow ? (
          <TouchableOpacity
            style={{ marginTop: 12, backgroundColor: "#f97316", borderRadius: 999, paddingVertical: 10, alignItems: "center" }}
            onPress={markNoShowAll}
            disabled={savingId === "all"}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>{t("hostParticipantsNoShow")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>{t("hostParticipantsEmpty")}</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <Text style={{ fontWeight: "800", color: "#0f172a" }}>{item.explorer?.name || item.explorer?.email || "—"}</Text>
            <Text style={{ color: "#475569", marginTop: 4 }}>{t("spotsLabel")}: {item.quantity || 1}</Text>
            <Text style={{ color: "#475569", marginTop: 2 }}>{t("hostParticipantsStatus")}: {item.status || "—"}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: livadaiColors.primary,
                  borderRadius: 999,
                  paddingVertical: 8,
                  alignItems: "center",
                  opacity: savingId === item._id ? 0.6 : 1,
                }}
                onPress={() => confirmAttendance(item._id)}
                disabled={!canMarkAttendance || savingId === item._id}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>{t("hostParticipantsConfirm")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingVertical: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#f1b9b9",
                  opacity: savingId === item._id ? 0.6 : 1,
                }}
                onPress={() => cancelParticipation(item._id)}
                disabled={savingId === item._id}
              >
                <Text style={{ color: "#b91c1c", fontWeight: "800" }}>{t("hostParticipantsCancel")}</Text>
              </TouchableOpacity>
            </View>
            {!canMarkAttendance ? (
              <Text style={{ color: "#6b7280", marginTop: 6, fontSize: 12 }}>{t("attendanceAvailableLater")}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}
