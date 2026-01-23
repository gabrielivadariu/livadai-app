import React, { useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function BookingDetailScreen({ route }) {
  const { bookingId } = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      const { data } = await api.get(`/bookings/${bookingId}`);
      setBooking(data);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || "Nu s-a putut încărca booking-ul");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  const canDispute = () => {
    if (!booking) return false;
    if (booking.status === "DISPUTED" || booking.status === "CANCELLED") return false;
    const end = booking.experience?.endsAt || booking.experience?.endDate || booking.date || booking.experience?.startDate;
    if (!end) return false;
    const endDate = new Date(end);
    if (Number.isNaN(endDate.getTime())) return false;
    const now = new Date();
    const windowStart = new Date(endDate.getTime() + 15 * 60 * 1000);
    const windowEnd = new Date(endDate.getTime() + 72 * 60 * 60 * 1000);
    return now >= windowStart && now <= windowEnd && (booking.explorer?._id === user?.id || booking.explorer === user?.id);
  };

  const submitDispute = async (reason) => {
    try {
      await api.post(`/bookings/${booking._id}/dispute`, { reason });
      Alert.alert("", t("reportSubmitted"));
      await load();
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("reportWindowExpired"));
    }
  };

  const openDispute = () => {
    const reasons = [
      { label: t("reportReasonNoShow") || "No-show", value: "NO_SHOW" },
      { label: t("reportReasonQuality") || "Low quality", value: "LOW_QUALITY" },
      { label: t("reportReasonSafety") || "Safety", value: "SAFETY" },
      { label: t("other") || "Other", value: "OTHER" },
    ];
    Alert.alert(t("reportProblem"), t("reportReason"), [
      ...reasons.map((r) => ({ text: r.label, onPress: () => submitDispute(r.value) })),
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!booking) return <Text style={{ padding: 16 }}>{t("notFound")}</Text>;

  const exp = booking.experience || {};
  const explorer = booking.explorer || {};
  const isExplorer = user?.role === "EXPLORER";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{exp.title}</Text>
        <Text style={styles.sub}>{exp.startsAt ? new Date(exp.startsAt).toLocaleString() : ""}</Text>
        <Text style={styles.sub}>{t("spotsLabel")}: {booking.quantity || 1}</Text>
        <View style={[styles.badge, { backgroundColor: "#e0f2fe" }]}>
          <Text style={styles.badgeText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>{t("explorerLabel")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
          <Image
            source={{ uri: explorer.profilePhoto || explorer.avatar || "https://via.placeholder.com/80x80?text=User" }}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e2e8f0" }}
          />
          <Text style={{ fontWeight: "800", color: "#0f172a" }}>{explorer.name || explorer.displayName || booking.explorer}</Text>
        </View>
      </View>

      {isExplorer && canDispute() && (
        <View style={styles.card}>
          <Text style={styles.section}>{t("reportProblem")}</Text>
          <TouchableOpacity onPress={openDispute} style={[styles.btn, { marginTop: 10, backgroundColor: "#ef4444" }]}>
            <Text style={styles.btnText}>{t("reportProblem")}</Text>
          </TouchableOpacity>
          <Text style={{ color: "#6b7280", marginTop: 6, fontSize: 12 }}>{t("reportWindowHint")}</Text>
        </View>
      )}

      {isExplorer ? null : (
        <View style={styles.card}>
          <Text style={styles.section}>{t("participants")}</Text>
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Image
              source={{ uri: explorer.profilePhoto || explorer.avatar || "https://via.placeholder.com/80x80?text=User" }}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e2e8f0" }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800", color: "#0f172a" }}>
                {explorer.name || explorer.displayName || booking.explorer}
              </Text>
              {booking.canViewClientPhone && explorer.phone ? (
                <Text style={{ color: "#475569", marginTop: 2 }}>{explorer.phone}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => {
                if (navigation && booking._id) {
                  navigation.navigate("Chat", {
                    bookingId: booking._id,
                    otherUserId: explorer._id || booking.explorer,
                    otherUserName: explorer.name || explorer.displayName,
                    otherUserAvatar: explorer.profilePhoto || explorer.avatar,
                    experienceTitle: exp.title,
                  });
                }
              }}
              style={styles.secondaryBtn}
            >
              <Text style={[styles.btnText, { color: livadaiColors.primary }]}>{t("chatSend")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isExplorer ? null : (
        <View style={styles.card}>
          <Text style={styles.section}>{t("confirmTitle")}</Text>
          <Text style={{ color: "#475569", marginTop: 4 }}>{t("confirmBody")}</Text>
          <Text style={{ color: "#475569", marginTop: 8 }}>{t("hostParticipantsActionsHint")}</Text>
        </View>
      )}

      {isExplorer && canDispute() && (
        <View style={styles.card}>
          <Text style={styles.section}>{t("reportProblem")}</Text>
          <TouchableOpacity onPress={openDispute} style={[styles.btn, { marginTop: 10, backgroundColor: "#ef4444" }]}>
            <Text style={styles.btnText}>{t("reportProblem")}</Text>
          </TouchableOpacity>
          <Text style={{ color: "#6b7280", marginTop: 6, fontSize: 12 }}>{t("reportWindowHint")}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  sub: { color: "#475569", marginTop: 4 },
  badge: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: "#075985", fontWeight: "800" },
  section: { fontWeight: "800", color: "#0f172a" },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});
