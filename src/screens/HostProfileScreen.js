import React, { useEffect, useState, useContext, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { subscribeRefreshHostProfile } from "../utils/eventBus";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import ScreenHeader from "../components/ScreenHeader";

export default function HostProfileScreen({ route, navigation }) {
  const { hostId } = route.params || {};
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const effectiveHostId = hostId || user?._id;
  const isSelf = user?._id === effectiveHostId;
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!effectiveHostId) return;
    try {
      const profRes = await api.get(`/hosts/${effectiveHostId}/profile`);
      const revRes = await api.get(`/hosts/${effectiveHostId}/reviews`);
      const actRes = await api.get(`/hosts/${effectiveHostId}/activities`, { params: { limit: 5 } });
      setProfile(profRes.data);
      setReviews(revRes.data || []);
      setActivities(actRes.data || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [effectiveHostId]);

  useEffect(() => {
    if (effectiveHostId) load();
    const unsub = subscribeRefreshHostProfile(load);
    return () => unsub?.();
  }, [effectiveHostId, load]);

  useFocusEffect(
    useCallback(() => {
      if (effectiveHostId) load();
    }, [effectiveHostId, load])
  );

  const uploadAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
      if (res.canceled || !res.assets) return;
      const asset = res.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop() || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      });
      const upload = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: () => formData,
      });
      await api.put("/hosts/me/profile", { avatar: upload.data.url });
      setProfile((p) => ({ ...p, avatar: upload.data.url }));
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || "Avatar update failed");
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t("hostProfileTitle")} onBack={() => navigation.goBack()} />
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t("hostProfileTitle")} onBack={() => navigation.goBack()} />
        <Text style={{ padding: 16 }}>Host not found</Text>
      </SafeAreaView>
    );
  }

  const topReviews = reviews.slice(0, 5);
  const languagesArr = Array.isArray(profile.languages)
    ? profile.languages.map((l) => l.toUpperCase())
    : typeof profile.languages === "string" && profile.languages.trim()
    ? profile.languages
        .split(/[;,\\s]+/)
        .map((l) => l.toUpperCase())
        .filter(Boolean)
    : [];
  const langMap = SUPPORTED_LANGUAGES.reduce((acc, l) => {
    acc[l.code.toUpperCase()] = l.label;
    return acc;
  }, {});
  const showPhone = isSelf || profile.canViewPhone;
  const phoneValue = showPhone ? profile.phone : t("phoneAfterBooking", { defaultValue: "Disponibil după rezervare" });
  const experienceVal = profile.experienceDescription || profile.experience || profile.experience_description || "";

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("hostProfileTitle")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 }}>
        <View style={styles.headerCard}>
          <TouchableOpacity disabled={!isSelf} onPress={isSelf ? uploadAvatar : undefined}>
            <Image source={{ uri: profile.avatar || "https://via.placeholder.com/80" }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{profile.display_name || profile.name}</Text>
                <Text style={styles.subTitle}>
                  {profile.age ? `${profile.age} · ` : ""}
                  {profile.city ? `${profile.city}, ` : ""}
                  {profile.country || ""}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" color="#f59e0b" size={16} />
                  <Text style={styles.ratingText}>
                    {Number(profile.rating_avg || 0).toFixed(1)} ({profile.rating_count || 0} {t("reviewsCount")})
                  </Text>
                </View>
              </View>
              {isSelf ? (
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("EditHostProfile")}>
                  <Text style={styles.editText}>{t("edit")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("hostAboutMe")}</Text>
          <Text style={styles.body}>{profile.about_me || t("hostNoDescription")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("hostExperience")}</Text>
          <Text style={styles.body}>{experienceVal || "-"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("languagesLabel")}</Text>
          <Text style={styles.body}>
            {languagesArr.length
              ? languagesArr
                  .map((code) => langMap[code] || code)
                  .join(" · ")
              : "-"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("hostStats", { defaultValue: "Statistici" })}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.total_events || 0}</Text>
              <Text style={styles.statLabel}>{t("hostTotalEvents")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.total_participants || 0}</Text>
              <Text style={styles.statLabel}>{t("hostTotalParticipants")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.rating_count || 0}</Text>
              <Text style={styles.statLabel}>{t("reviewsCount")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("phone")}</Text>
          <Text style={styles.body}>{phoneValue || "-"}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>{t("reviews")}</Text>
          {reviews.length > 5 ? (
            <TouchableOpacity onPress={() => navigation.navigate("Reviews", { hostId })}>
              <Text style={styles.link}>{t("seeAll")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {topReviews.length === 0 ? (
          <Text style={styles.body}>{t("noReviews")}</Text>
        ) : (
          topReviews.map((r) => (
            <View key={r._id || r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{r.author?.name || r.author_name || t("guest")}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" color="#f59e0b" size={14} />
                  <Text style={styles.ratingText}>{r.rating}</Text>
                </View>
              </View>
                <Text style={styles.reviewDate}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</Text>
                <Text style={styles.reviewBody}>{r.comment || r.text}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("hostedExperiences")}</Text>
          {activities.length === 0 ? (
            <Text style={styles.body}>{t("noHostedExperiences")}</Text>
          ) : (
            activities.slice(0, 3).map((a) => (
              <View key={a._id} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activityMeta}>
                  {a.startDate ? new Date(a.startDate).toLocaleDateString() : ""} {a.startTime || ""}
                </Text>
                <Text style={styles.activityMeta}>{a.city || a.address || ""}</Text>
                <Text style={styles.activityStatus}>
                  {a.startDate && new Date(a.startDate) > new Date() ? t("upcoming") : t("completed")}
                </Text>
              </View>
            ))
          )}
          {activities.length >= 3 ? (
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => {
                const parentNav = navigation.getParent?.();
                if (parentNav) {
                  parentNav.navigate("ExperiencesTab", {
                    screen: "ExperienceList",
                    params: { hostId: effectiveHostId },
                  });
                } else {
                  navigation.navigate("ExperienceList", { hostId: effectiveHostId });
                }
              }}
            >
              <Text style={styles.link}>{t("seeAllHosted")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isSelf ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("account")}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>{t("deleteAccount")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate("ExperienceList", { hostId })}>
          <Text style={styles.ctaText}>See upcoming events</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  headerCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: livadaiColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 12,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e5e7eb" },
  name: { fontSize: 20, fontWeight: "800", color: livadaiColors.primaryText },
  subTitle: { color: livadaiColors.secondaryText, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { marginLeft: 4, color: livadaiColors.primaryText, fontWeight: "700" },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: livadaiColors.primary },
  editText: { color: livadaiColors.primary, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: livadaiColors.primaryText, marginBottom: 8 },
  body: { color: livadaiColors.primaryText, lineHeight: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: livadaiColors.border },
  infoLabel: { color: livadaiColors.secondaryText },
  infoValue: { color: livadaiColors.primaryText, fontWeight: "600" },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { color: livadaiColors.primary, fontWeight: "700" },
  reviewCard: { marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: livadaiColors.card, borderWidth: 1, borderColor: livadaiColors.border },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewAuthor: { fontWeight: "700", color: livadaiColors.primaryText },
  reviewDate: { color: livadaiColors.secondaryText, fontSize: 12 },
  reviewBody: { color: livadaiColors.primaryText, marginTop: 6, lineHeight: 20 },
  cta: { marginTop: 16, backgroundColor: livadaiColors.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "800" },
  activityCard: { marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: livadaiColors.card, borderWidth: 1, borderColor: livadaiColors.border },
  activityTitle: { fontWeight: "800", color: livadaiColors.primaryText },
  activityMeta: { color: livadaiColors.secondaryText, marginTop: 2 },
  activityStatus: { color: livadaiColors.primary, fontWeight: "700", marginTop: 4 },
  outlineBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: livadaiColors.primary,
  },
  chip: {
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { color: "#0f172a", fontWeight: "700", fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: livadaiColors.border,
  },
  statNumber: { fontWeight: "900", fontSize: 18, color: livadaiColors.primaryText },
  statLabel: { color: livadaiColors.secondaryText, fontSize: 12, textAlign: "center", marginTop: 4 },
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
});
