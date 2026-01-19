import React, { useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { livadaiColors } from "../theme/theme";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function MenuSheet({ visible, onClose }) {
  const navigation = useNavigation();
  const { i18n, t } = useTranslation();
  const { logout, user } = useContext(AuthContext);
  const isHost = user?.role === "HOST" || user?.role === "BOTH";

  const changeLang = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem("lang", lng);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const goTo = (title, routeOverride) => {
    onClose();
    if (routeOverride) {
      navigation.navigate(routeOverride);
      return;
    }
    navigation.navigate("Info", { title });
  };

  const rows = [
    {
      title: t("preferences"),
      items: [{ label: t("language"), icon: "language-outline", action: null }],
    },
    {
      title: t("exploreSection"),
      items: [
        ...(isHost
          ? [{ label: t("howItWorksHost"), icon: "briefcase-outline", route: "HowItWorksHost" }]
          : [{ label: t("howItWorks"), icon: "help-circle-outline" }]),
        ...(isHost ? [] : [{ label: t("trustSafety"), icon: "shield-checkmark-outline" }]),
      ],
    },
    {
      title: t("legal"),
      items: [
        { label: t("aboutApp"), icon: "information-circle-outline" },
        { label: t("privacy"), icon: "lock-closed-outline" },
        { label: t("terms"), icon: "document-text-outline" },
      ],
    },
    {
      title: t("contact"),
      items: [
        { label: t("contactUs"), icon: "chatbubbles-outline" },
      ],
    },
  ];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.appName}>LIVADAI</Text>
            <Text style={styles.subtitle}>{t("settingsSubtitle")}</Text>
          </View>
          <ScrollView contentContainerStyle={{ gap: 16 }}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t("preferences")}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.rowLabel}>{t("language")}</Text>
                <View style={styles.langRow}>
                  <TouchableOpacity style={styles.langButton} onPress={() => changeLang("en")}>
                    <Text style={styles.langText}>{t("english")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.langButton} onPress={() => changeLang("ro")}>
                    <Text style={styles.langText}>{t("romanian")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {rows.slice(1).map((section) => (
              <View key={section.title} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.itemRow}
                    onPress={() => goTo(item.label, item.route)}
                  >
                    <Ionicons name={item.icon} size={20} color={livadaiColors.primaryText} />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: livadaiColors.card,
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: livadaiColors.border,
    borderWidth: 1,
    gap: 16,
    maxHeight: "85%",
  },
  header: { gap: 4 },
  appName: { color: livadaiColors.primaryText, fontSize: 22, fontWeight: "900" },
  subtitle: { color: livadaiColors.secondaryText, fontSize: 14 },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    backgroundColor: "#f8fafc",
    padding: 12,
    gap: 8,
  },
  sectionTitle: { color: livadaiColors.accent, fontWeight: "800", fontSize: 13 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { color: livadaiColors.primaryText, fontWeight: "700", fontSize: 15 },
  langRow: { flexDirection: "row", gap: 8 },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    backgroundColor: "#fff",
  },
  langText: { color: livadaiColors.primaryText, fontWeight: "700" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  itemLabel: { color: livadaiColors.primaryText, fontSize: 15, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  logoutText: { color: "#b91c1c", fontWeight: "800" },
});
