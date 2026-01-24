import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image, AppState, TextInput } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { getCategoryColor } from "../constants/categoryColors";
import { livadaiColors } from "../theme/theme";
import MenuSheet from "../components/MenuSheet";
import AppHeader from "../components/AppHeader";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { subscribeRefreshExperiences } from "../utils/eventBus";

export default function ExperienceListScreen({ navigation, route }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const isHost = user?.role === "HOST";
  const hostIdFilter = route?.params?.hostId;
  const normalizedHostId =
    typeof hostIdFilter === "string" ? hostIdFilter : hostIdFilter?._id || hostIdFilter?.id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (normalizedHostId) {
        const { data } = await api.get(`/hosts/${normalizedHostId}/activities`);
        setItems(data || []);
      } else {
        const { data } = await api.get("/experiences");
        setItems(data || []);
      }
    } catch (_e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [normalizedHostId]);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    const unsubBus = subscribeRefreshExperiences(load);
    return () => {
      sub?.remove();
      unsubBus?.();
    };
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        const count = data?.filter((n) => !n.isRead)?.length || 0;
        setUnread(count);
      } catch (_e) {
        setUnread(0);
      }
    };
    loadNotifications();
    const focus = navigation.addListener("focus", loadNotifications);
    return focus;
  }, [navigation]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handle);
  }, [search]);

  const filteredItems = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    const base = normalizedHostId ? items.filter((it) => (it.host?._id || it.host) === normalizedHostId) : items;
    if (!term) return base;
    return base.filter((it) => {
      const title = (it.title || "").toLowerCase();
      const address = (it.address || "").toLowerCase();
      const desc = (it.description || "").toLowerCase();
      return title.includes(term) || address.includes(term) || desc.includes(term);
    });
  }, [items, search, hostIdFilter]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const renderItem = ({ item, index }) => {
    const catColor = getCategoryColor(item.category);
    const isFree = !item.price || Number(item.price) <= 0;
    const priceText = isFree ? t("free") : `${item.price || 0} ${item.currencyCode || "RON"}`;
    const languagesShort = item.languages?.length ? item.languages.map((l) => l.toUpperCase()).slice(0, 2).join(" · ") : null;
    const extraLangs = item.languages?.length > 2 ? ` +${item.languages.length - 2}` : "";
    const showSpots = item.activityType === "GROUP" && (item.maxParticipants || 0) > 1;
    const available = item.availableSpots ?? item.remainingSpots ?? item.maxParticipants;
    const totalSeats = item.maxParticipants || 0;
    const occupiedSeats = totalSeats ? Math.max(0, totalSeats - (available ?? 0)) : 0;
    const soldOut = showSpots && (available ?? 0) <= 0;
    const locale = i18n.language?.startsWith("ro") ? "ro-RO" : "en-US";
    const start = item.startsAt || item.startDate;
    const end = item.endsAt || item.endDate;
    const startDate = start ? new Date(start) : null;
    let endDate = end ? new Date(end) : null;
    const durationMinutes = item.durationMinutes;
    if (!endDate && startDate && durationMinutes) {
      endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    }
    const computedDuration =
      durationMinutes || (startDate && endDate ? Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000)) : null);
    let durationLabel = null;
    if (computedDuration && computedDuration > 0) {
      const hours = Math.max(1, Math.round((computedDuration / 60) * 10) / 10);
      durationLabel = `⏳${hours}h`;
    }
    const dateLabel = startDate
      ? startDate.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
      : null;

    return (
      <Animated.View entering={FadeInUp.delay(index * 40)} style={[styles.card, soldOut && { opacity: 0.6 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("ExperienceDetail", { id: item._id })}>
          <View style={{ position: "relative" }}>
            {item.coverImageUrl ? (
              <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
            ) : (
              <LinearGradient colors={["#ecfeff", "#e0f7fa"]} style={[styles.cover, { alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="leaf" size={36} color={catColor} />
              </LinearGradient>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.35)"]}
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, borderRadius: 12 }}
            />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.location} numberOfLines={1}>
                  <Ionicons name="location-outline" size={14} color="#64748b" /> {item.city || ""} {item.country || item.address || ""}
                </Text>
                {item.shortDescription ? (
                  <Text style={styles.shortDesc} numberOfLines={1}>
                    {item.shortDescription}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.priceBadge, isFree && { backgroundColor: "#10b981" }]}>
                <Text style={styles.priceText}>{priceText}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              {languagesShort ? (
                <View style={styles.metaItem}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color="#475569" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {languagesShort}
                    {extraLangs}
                  </Text>
                </View>
              ) : null}

              {item.environment ? (
                <View style={styles.metaItem}>
                  <Ionicons name="leaf-outline" size={14} color="#0f172a" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.environment === "INDOOR"
                      ? t("envIndoor")
                      : item.environment === "BOTH"
                      ? t("envBoth")
                      : t("envOutdoor")}
                  </Text>
                </View>
              ) : null}

                {dateLabel ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#475569" />
                    <Text style={styles.metaText} numberOfLines={1}>{dateLabel}</Text>
                  </View>
                ) : null}

                {durationLabel ? (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText} numberOfLines={1}>{durationLabel}</Text>
                  </View>
                ) : null}
                {showSpots ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color="#475569" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {t("groupSlots", { booked: occupiedSeats, total: totalSeats })} {t("participants")}
                    </Text>
                  </View>
                ) : null}
            </View>

            {item.rating_avg ? (
              <Text style={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</Text>
            ) : soldOut ? (
              <View style={styles.soldBadge}>
                <Text style={styles.soldText}>{t("soldOut")}</Text>
              </View>
            ) : null}

          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const emptyText =
    items.length === 0
      ? "No experiences yet. Be the first to explore something new."
      : search.length > 0 && filteredItems.length === 0
        ? "No results found for your search."
        : "";

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={["top", "left", "right"]}>
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <AppHeader
        variant="explore"
        onMenu={() => setMenuVisible(true)}
        onNotifications={() => navigation.navigate("Notifications")}
        onAdd={isHost ? () => navigation.navigate("CreateActivity") : undefined}
        unread={unread}
        renderSearch={
          <View style={styles.searchWrap}>
            <TextInput
              placeholder="Search experiences, cities or countries"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={livadaiColors.secondaryText} />
              </TouchableOpacity>
            ) : null}
          </View>
        }
        onChat={() => navigation.navigate("Conversations")}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerIcon: {
    padding: 6,
  },
  headerTitle: {
    color: livadaiColors.primary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    paddingVertical: 10,
  },
  clearBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  bellBtn: { padding: 8 },
  badgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0ea5e9",
  },
  msgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00c2a8",
    alignItems: "center",
    justifyContent: "center",
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#00c2a8",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: 190,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBody: {
    padding: 12,
    gap: 10,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { color: "#0f172a", fontWeight: "800", fontSize: 17, flex: 1 },
  priceBadge: {
    backgroundColor: livadaiColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 72,
    alignItems: "center",
  },
  priceText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  location: { color: "#475569", fontSize: 13, marginTop: 2 },
  shortDesc: { color: "#64748b", fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "nowrap", gap: 6, marginTop: 6, alignItems: "center" },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexShrink: 1,
  },
  metaText: { color: "#0f172a", fontSize: 12, lineHeight: 14, flexShrink: 1 },
  rating: { color: "#0f172a", fontWeight: "700", marginTop: 4 },
  timeCompact: {
    marginTop: 10,
    alignSelf: "flex-end",
    alignItems: "flex-end",
    gap: 2,
  },
  soldBadge: {
    marginTop: 6,
    backgroundColor: "#dc2626",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  soldText: { color: "#fff", fontWeight: "800" },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 10,
    padding: 14,
    borderRadius: 28,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  search: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    marginBottom: 12,
    marginTop: 4,
  },
});
