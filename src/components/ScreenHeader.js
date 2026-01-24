import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";

export default function ScreenHeader({ title, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 2 }]}>
      <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={26} color={livadaiColors.primary} />
      </TouchableOpacity>
      <Text style={styles.header}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f7fb", paddingHorizontal: 12, paddingBottom: 10 },
  header: { fontSize: 22, fontWeight: "900", color: livadaiColors.primary, paddingLeft: 44 },
  backButton: {
    position: "absolute",
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    zIndex: 10,
  },
});
