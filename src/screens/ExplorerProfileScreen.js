import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

export default function ExplorerProfileScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("CONDUCT");
  const [reportComment, setReportComment] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const insets = useSafeAreaInsets();
  const userId = route?.params?.userId;
  const isOwnProfile = !userId;
  const { logout } = useContext(AuthContext);

  const loadProfile = async () => {
    try {
      const url = userId ? `/users/${userId}/public-profile` : "/users/me/profile";
      const { data } = await api.get(url);
      setProfile(data);
      if (!userId) {
        try {
          const favRes = await api.get("/users/me/favorites");
          setFavorites(favRes.data || []);
        } catch (_e) {
          setFavorites([]);
        } finally {
          setFavoritesLoading(false);
        }
      } else {
        setFavorites([]);
        setFavoritesLoading(false);
      }
    } catch (_e) {
      Alert.alert(t("error"), t("loadError", { defaultValue: "Could not load profile" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadProfile);
    return unsub;
  }, [navigation, userId]);

  const submitReport = async () => {
    if (!reportComment.trim()) {
      Alert.alert("", t("reportCommentRequired", { defaultValue: "Te rugăm să adaugi un comentariu." }));
      return;
    }
    setSubmittingReport(true);
    try {
      await api.post("/bookings/report-user", {
        targetUserId: userId,
        reason: reportReason,
        comment: reportComment.trim(),
      });
      Alert.alert("", t("reportSubmitted", { defaultValue: "Raport trimis. Mulțumim!" }));
      setReportModal(false);
      setReportComment("");
      setReportReason("CONDUCT");
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("reportFailed", { defaultValue: "Nu am putut trimite raportul" }));
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("deleteAccountConfirmTitle"), t("deleteAccountConfirmBody"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("continue"),
        style: "destructive",
        onPress: () => {
          Alert.alert(t("deleteAccountFinalTitle"), t("deleteAccountFinalBody"), [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("deletePermanently"),
              style: "destructive",
              onPress: async () => {
                try {
                  await api.delete("/users/me");
                  await logout();
                  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                } catch (e) {
                  const msg = e?.response?.data?.message || t("deleteAccountFailed");
                  Alert.alert("", msg);
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  if (loading) return <Text style={{ padding: 16 }}>{t("loading")}</Text>;

  const languages = profile?.languages?.length ? profile.languages.map((l) => l.toUpperCase()).join(", ") : null;
  const history = profile?.history || [];
  const phoneVerified = !!profile?.phoneVerified;
  const isTrusted = !!profile?.isTrustedParticipant;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb", paddingTop: insets.top + 12 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardCenter}>
          <View style={styles.avatarBox}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={42} color="#fff" />
          )}
        </View>
        <Text style={styles.name}>{profile?.name || t("profileTab")}</Text>
        {profile?.age ? <Text style={styles.secondary}>{t("age")}: {profile.age}</Text> : null}
        <View style={styles.statsBox}>
          <Text style={styles.statLabel}>{t("completedExperiences")}</Text>
          <Text style={styles.statValue}>{profile?.experiencesCount ?? 0}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {isTrusted ? (
            <View style={[styles.badgeInfo, { backgroundColor: "#e0f2fe", borderColor: "#7dd3fc" }]}>
              <Ionicons name="thumbs-up" size={16} color="#0ea5e9" />
              <Text style={[styles.badgeInfoText, { color: "#075985", fontWeight: "800" }]}>{t("trustedParticipant")}</Text>
            </View>
          ) : null}
          {phoneVerified ? (
            <View style={[styles.badgeInfo, { backgroundColor: "#dcfce7", borderColor: "#22c55e" }]}>
              <Ionicons name="shield-checkmark" size={16} color="#15803d" />
              <Text style={[styles.badgeInfoText, { color: "#14532d", fontWeight: "800" }]}>{t("phoneVerified")}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        {isOwnProfile ? (
          <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={[styles.editBtn, { flex: 1 }]} onPress={() => navigation.navigate("EditExplorerProfile")}>
              <Text style={styles.editText}>{t("editProfile")}</Text>
            </TouchableOpacity>
            {/* rollback: devino gazda flux dezactivat */}
          </View>
        ) : (
          <TouchableOpacity style={[styles.reportBtn, { flex: 1 }]} onPress={() => setReportModal(true)}>
            <Text style={styles.editText}>{t("reportUser", { defaultValue: "Raportează utilizator" })}</Text>
          </TouchableOpacity>
        )}
        </View>
        </View>

        <View style={styles.card}>
          {profile?.age ? (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#0f172a" />
              <Text style={styles.body}>
                {profile.age} {t("yearsOld")}
              </Text>
            </View>
          ) : null}
          {languages ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0f172a" />
              <Text style={styles.body}>{languages}</Text>
            </View>
          ) : null}
          {profile?.shortBio ? (
            <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
              <Ionicons name="book-outline" size={16} color="#0f172a" style={{ marginTop: 2 }} />
              <Text style={styles.body}>{profile.shortBio}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={[styles.infoRow, { marginBottom: 6 }]}>
            <Ionicons name="time-outline" size={16} color="#0f172a" />
            <Text style={styles.sectionTitle}>{t("historyTitle")}</Text>
          </View>
          {history.length ? (
            history.map((h, idx) => (
              <View key={idx} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{h.experienceTitle || t("experience")}</Text>
                  <Text style={styles.secondary}>{h.date ? new Date(h.date).toLocaleString() : ""}</Text>
                  <Text style={styles.secondary}>
                    {t("hostLabel", { defaultValue: "Host" })}: {h.hostName || "-"}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t("completed")}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.secondary}>{t("noCompletedExperiences")}</Text>
          )}
        </View>

        {isOwnProfile ? (
          <View style={styles.card}>
            <View style={[styles.infoRow, { marginBottom: 6 }]}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.sectionTitle}>{t("favoriteExperiences", { defaultValue: "Favorite Experiences" })}</Text>
            </View>
            {favoritesLoading ? (
              <Text style={styles.secondary}>{t("loading")}</Text>
            ) : favorites.length ? (
              favorites.map((fav) => (
                <TouchableOpacity
                  key={fav._id}
                  style={styles.favoriteRow}
                  onPress={() => navigation.navigate("ExperienceDetail", { id: fav._id })}
                >
                  <Image
                    source={{ uri: fav.images?.[0] || "https://via.placeholder.com/80x80?text=Exp" }}
                    style={styles.favoriteImage}
                  />
                  <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteTitle} numberOfLines={1}>{fav.title}</Text>
                    <Text style={styles.secondary} numberOfLines={1}>
                      {fav.address || `${fav.city || ""} ${fav.country || ""}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.secondary}>{t("noFavorites", { defaultValue: "No favorites yet." })}</Text>
            )}
          </View>
        ) : null}

        {isOwnProfile ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("account")}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>{t("deleteAccount")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={reportModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{t("reportUser", { defaultValue: "Raportează utilizator" })}</Text>
            <Text style={styles.secondary}>{t("reportReason", { defaultValue: "Alege motivul" })}</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {["CONDUCT", "HARASSMENT", "FRAUD", "OTHER"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonRow, reportReason === r && { borderColor: livadaiColors.primary, backgroundColor: "#e0f7fa" }]}
                  onPress={() => setReportReason(r)}
                >
                  <Text style={{ fontWeight: "700", color: "#0f172a" }}>
                    {t(`reportReason_${r.toLowerCase()}`, {
                      defaultValue:
                        r === "CONDUCT"
                          ? "Conduită necorespunzătoare"
                          : r === "HARASSMENT"
                          ? "Hărțuire"
                          : r === "FRAUD"
                          ? "Fraudă"
                          : "Alt motiv",
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.secondary, { marginTop: 10 }]}>{t("comment", { defaultValue: "Comentariu" })}</Text>
            <TextInput
              value={reportComment}
              onChangeText={setReportComment}
              style={[styles.input, { height: 120, textAlignVertical: "top", marginTop: 6 }]}
              multiline
              placeholder={t("reportCommentPlaceholder", { defaultValue: "Descrie ce s-a întâmplat" })}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.editBtn, { flex: 1, backgroundColor: "#e5e7eb" }]} onPress={() => setReportModal(false)}>
                <Text style={[styles.editText, { color: "#0f172a" }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editBtn, { flex: 1, backgroundColor: livadaiColors.primary, opacity: submittingReport ? 0.6 : 1 }]}
                disabled={submittingReport}
                onPress={submitReport}
              >
                <Text style={styles.editText}>{submittingReport ? t("saving") : t("send", { defaultValue: "Trimite" })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  cardCenter: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: 12,
    marginBottom: 4,
  },
  avatarBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  name: { marginTop: 10, fontSize: 20, fontWeight: "800", color: "#0f172a" },
  secondary: { color: "#475569", marginTop: 4 },
  statsBox: { marginTop: 8, alignItems: "center" },
  statLabel: { color: "#475569" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  editBtn: {
    marginTop: 12,
    backgroundColor: livadaiColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  editText: { color: "#fff", fontWeight: "800" },
  reportBtn: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteText: { color: "#b91c1c", fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  body: { color: "#0f172a", flexShrink: 1 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  historyTitle: { fontWeight: "700", color: "#0f172a" },
  badge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  favoriteImage: { width: 54, height: 54, borderRadius: 12, backgroundColor: "#e2e8f0" },
  favoriteInfo: { flex: 1 },
  favoriteTitle: { fontWeight: "800", color: "#0f172a" },
  badgeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeInfoText: { color: "#334155", fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
  },
  reasonRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
