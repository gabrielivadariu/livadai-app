import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, AppState } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import AppHeader from "../components/AppHeader";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

const primary = "#00C2CC";
const bg = "#F5F7FB";

export default function HostDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ bookings: 0, rating: "-" });
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, hostRes, profileRes] = await Promise.all([
        api.get("/bookings/host"),
        api.get("/hosts/me/profile").catch(() => ({ data: null })),
        api.get("/users/me/profile").catch(() => ({ data: null })),
      ]);
      setStats({
        bookings: bookRes.data?.length || 0,
        rating: hostRes?.data?.rating_avg ? Number(hostRes.data.rating_avg).toFixed(1) : "-",
      });
      const resolvedName = profileRes?.data?.displayName || profileRes?.data?.name || "";
      setProfileName(resolvedName);
    } catch (e) {
      setStats({ bookings: 0, rating: "-" });
      setProfileName("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    return () => sub?.remove();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const ActionCard = ({ title, desc, icon, color = primary, onPress, primaryCard }) => (
    <TouchableOpacity style={[styles.actionCard, primaryCard && styles.actionCardPrimary]} onPress={onPress}>
      <View style={styles.actionIcon}> 
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 8 }]} edges={["top", "left", "right"]}>
      <AppHeader
        variant="simple"
        onNotifications={() => navigation.navigate("Notifications")}
        onFavorites={() => navigation.navigate("PublicProfile")}
        unread={0}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>{t("hostDashboardTitle")}</Text>
        <Text style={styles.subtitle}>{t("hostDashboardSubtitle", { name: profileName || "Host" })}</Text>

        <View style={styles.card}> 
          <Text style={styles.cardLabel}>{t("hostQuickStats")}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.bookings}</Text>
              <Text style={styles.statText}>{t("bookings")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.rating}</Text>
              <Text style={styles.statText}>{t("rating")}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <ActionCard
            title={t("hostProfileTitle")}
            desc={t("hostProfileSubtitle")}
            icon="person-circle"
            onPress={() => navigation.navigate("HostProfile", { hostId: user?._id })}
          />
          <ActionCard
            title={t("hostBookingsTitle")}
            desc={t("hostBookingsSubtitle")}
            icon="clipboard"
            onPress={() => navigation.navigate("HostBookings")}
          />
          <ActionCard
            title={t("hostWalletTitle")}
            desc={t("hostWalletSubtitle")}
            icon="card"
            color={primary}
            onPress={() => navigation.navigate("HostWallet")}
          />
          <ActionCard
            title={t("hostCreateExperienceTitle")}
            desc={t("hostCreateExperienceSubtitle")}
            icon="add-circle"
            color={primary}
            primaryCard
            onPress={() => navigation.navigate("CreateExperience")}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bg },
  brand: { fontSize: 26, fontWeight: "900", color: primary, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: "800", color: livadaiColors.primaryText },
  subtitle: { color: livadaiColors.secondaryText, marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLabel: { color: livadaiColors.secondaryText, marginBottom: 8, fontWeight: "700" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "800", color: livadaiColors.primaryText },
  statText: { color: livadaiColors.secondaryText },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionCardPrimary: { borderColor: primary },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionTitle: { fontWeight: "800", color: livadaiColors.primaryText },
  actionDesc: { color: livadaiColors.secondaryText, fontSize: 13, marginTop: 2 },
  logoutBtn: { alignItems: "center", marginTop: 20 },
  logoutText: { color: "#ef4444", fontWeight: "700" },
});
