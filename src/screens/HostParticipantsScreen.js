import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { livadaiColors } from "../theme/theme";

export default function HostParticipantsScreen({ route, navigation }) {
  const { experienceId } = route.params;
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(null);

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
  const windowStartValue =
    experience?.startsAt || experience?.startDate || experience?.date || experience?.endDate || experience?.endsAt;
  const windowEndValue =
    experience?.endsAt || experience?.endDate || experience?.date || experience?.startDate || experience?.startsAt;
  const startDate = windowStartValue ? new Date(windowStartValue) : null;
  const endDate = windowEndValue ? new Date(windowEndValue) : null;
  const isValidStart = startDate && !Number.isNaN(startDate.getTime());
  const isValidEnd = endDate && !Number.isNaN(endDate.getTime());
  const now = new Date();
  const confirmAfter = isValidStart ? new Date(startDate.getTime() + 15 * 60 * 1000) : null;
  const confirmUntil = isValidEnd ? new Date(endDate.getTime() + 48 * 60 * 60 * 1000) : null;
  const isBeforeWindow = confirmAfter ? now < confirmAfter : true;
  const isAfterWindow = confirmUntil ? now > confirmUntil : false;
  const canConfirm = !isBeforeWindow && !isAfterWindow;

  const actionableStatuses = new Set(["PAID", "DEPOSIT_PAID", "PENDING_ATTENDANCE"]);
  const actionableBookings = bookings.filter((b) => actionableStatuses.has(b.status));

  const confirmAll = () => {
    if (!actionableBookings.length) return;
    Alert.alert(
      t("confirmAttendanceTitle"),
      t("hostParticipantsConfirmAllMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirmAttendanceConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingAction("confirm");
              for (const b of actionableBookings) {
                await api.post(`/bookings/${b._id}/confirm-attendance`);
              }
              await load();
            } catch (e) {
              Alert.alert("", e?.response?.data?.message || t("hostBookingConfirmFailed"));
            } finally {
              setSavingAction(null);
            }
          },
        },
      ]
    );
  };

  const cancelAll = () => {
    if (!actionableBookings.length) return;
    Alert.alert(
      t("hostParticipantsCancelAllTitle"),
      t("hostParticipantsCancelAllMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("hostParticipantsCancelAllConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingAction("cancel");
              for (const b of actionableBookings) {
                await api.post(`/bookings/${b._id}/cancel-by-host`);
              }
              await load();
            } catch (e) {
              Alert.alert("", e?.response?.data?.message || t("hostBookingCancelFailed"));
            } finally {
              setSavingAction(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
        <Text style={{ fontWeight: "800", color: "#0f172a", fontSize: 18 }}>{experience?.title || t("hostParticipantsTitle")}</Text>
        <Text style={{ color: "#475569", marginTop: 4 }}>{t("hostParticipantsOccupied")}: {bookedSeats} / {totalSeats}</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>{t("hostParticipantsEmpty")}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", flexDirection: "row", gap: 12, alignItems: "center" }}
            onPress={() => navigation.navigate("PublicProfile", { userId: item.explorer?._id })}
            disabled={!item.explorer?._id}
          >
            <Image
              source={{ uri: item.explorer?.avatar || item.explorer?.profilePhoto || "https://via.placeholder.com/80x80?text=User" }}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#e2e8f0" }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800", color: "#0f172a" }}>{item.explorer?.name || item.explorer?.email || "—"}</Text>
              <Text style={{ color: "#475569", marginTop: 4 }}>{t("spotsLabel")}: {item.quantity || 1}</Text>
              <Text style={{ color: "#475569", marginTop: 2 }}>{t("hostParticipantsStatus")}: {item.status || "—"}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          bookings.length ? (
            <View style={{ marginTop: 6, gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: livadaiColors.primary,
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: savingAction === "confirm" || !actionableBookings.length || !canConfirm ? 0.6 : 1,
                }}
                onPress={confirmAll}
                disabled={savingAction === "confirm" || !actionableBookings.length || !canConfirm}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>{t("hostParticipantsConfirmAll")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#f1b9b9",
                  opacity: savingAction === "cancel" || !actionableBookings.length ? 0.6 : 1,
                }}
                onPress={cancelAll}
                disabled={savingAction === "cancel" || !actionableBookings.length}
              >
                <Text style={{ color: "#b91c1c", fontWeight: "800" }}>{t("hostParticipantsCancelAll")}</Text>
              </TouchableOpacity>
              {!canConfirm ? (
                <Text style={{ color: "#6b7280", marginTop: 4 }}>
                  {isAfterWindow ? t("hostParticipantsConfirmExpired") : t("hostParticipantsConfirmWait")}
                </Text>
              ) : null}
            </View>
          ) : null
        }
      />
    </View>
  );
}
