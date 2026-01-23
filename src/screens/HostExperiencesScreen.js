import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StyleSheet, AppState } from "react-native";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { subscribeRefreshExperiences, emitRefreshExperiences } from "../utils/eventBus";

export default function HostExperiencesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/experiences/me");
      setItems(data);
    } catch (_e) {
      setError(t("hostExperiencesLoadError", { defaultValue: "Nu s-au putut încărca experiențele" }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

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

  const confirmPause = async (id) => {
    Alert.alert(
      t("experiencePauseConfirmTitle"),
      t("experiencePauseConfirmBody"),
      [
        { text: t("cancel") },
        {
          text: t("confirm"),
          onPress: async () => {
            try {
              await api.patch(`/experiences/${id}`, { isActive: false, status: "DISABLED" });
              setItems((prev) =>
                prev.map((it) => (it._id === id ? { ...it, status: "DISABLED", isActive: false } : it))
              );
              emitRefreshExperiences();
            } catch (_e) {
              Alert.alert("", t("experiencePauseFailed", { defaultValue: "Nu s-a putut dezactiva experiența" }));
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

  const computeStatus = (item) => {
    if (item.status === "DISABLED" || item.isActive === false)
      return { label: t("statusPaused"), bg: "#e2e8f0", color: "#475569" };
    if (item.soldOut) return { label: t("statusSoldOut"), bg: "#fef9c3", color: "#92400e" };
    return { label: t("statusActive"), bg: "#dcfce7", color: "#166534" };
  };

  return (
    <FlatList
      data={[...items].reverse()}
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
      renderItem={({ item }) => {
        const badge = computeStatus(item);
        return (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>
                  {item.price} {item.currencyCode || "RON"} · {item.environment ? t(item.environment.toLowerCase()) : ""}
                </Text>
                <Text style={styles.subtitle}>{item.category}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={{ color: badge.color, fontWeight: "800" }}>{badge.label}</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 12, gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditExperience", { experience: item })}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>{t("editExperience")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmPause(item._id)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>{t("pauseExperience")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={{ padding: 16 }}>{t("hostExperiencesEmpty", { defaultValue: "Nu ai experiențe create." })}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  subtitle: { color: "#475569", marginTop: 4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginTop: 8 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#00c2a8",
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94a3b8",
    alignItems: "center",
  },
  secondaryText: { color: "#475569", fontWeight: "800" },
});
