import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";

export default function AppHeader({
  variant = "explore", // "explore" | "simple"
  onMenu,
  onNotifications,
  onFavorites,
  onChat,
  onAdd,
  unread = 0,
  searchValue,
  onSearchChange,
  searchPlaceholder = "",
  renderSearch,
}) {
  const isExplore = variant === "explore";

  return (
    <View style={styles.wrap}>
      <View style={styles.logoRow}>
        <Text style={styles.logo}>LIVADAI</Text>
      </View>
      <View style={styles.controlRow}>
        {isExplore ? (
          <TouchableOpacity onPress={onMenu} style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={22} color={livadaiColors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconSpacer} />
        )}

        {isExplore ? (
          renderSearch ? (
            renderSearch
          ) : (
            <TextInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChangeText={onSearchChange}
              style={styles.search}
              placeholderTextColor="#94a3b8"
            />
          )
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={styles.actions}>
          <TouchableOpacity onPress={onNotifications} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={livadaiColors.primary} />
            {unread > 0 ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
          {onFavorites ? (
            <TouchableOpacity onPress={onFavorites} style={styles.iconBtn}>
              <Ionicons name="star-outline" size={22} color={livadaiColors.primary} />
            </TouchableOpacity>
          ) : null}
          {isExplore ? (
            <>
              <TouchableOpacity onPress={onChat} style={styles.iconBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={livadaiColors.primary} />
              </TouchableOpacity>
              {onAdd ? (
                <TouchableOpacity onPress={onAdd} style={styles.iconBtn}>
                  <Ionicons name="add-outline" size={22} color={livadaiColors.primary} />
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, paddingTop: 0, paddingBottom: 8 },
  logoRow: { alignItems: "center", marginTop: -10 },
  logo: { color: livadaiColors.primary, fontSize: 30, fontWeight: "900", letterSpacing: 1.2 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 0,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  iconSpacer: { width: 38 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0ea5e9",
  },
  search: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    minHeight: 44,
  },
});
