import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function ReviewScreen({ route, navigation }) {
  const { bookingId, hostId, experienceId, experienceTitle } = route.params || {};
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await api.post(`/hosts/${hostId}/reviews`, { experienceId, bookingId, rating, comment });
      Alert.alert("", t("reviewSaved"), [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("reviewFailed"));
    } finally {
      setLoading(false);
    }
  };

  const changeRating = (delta) => {
    setRating((r) => Math.min(5, Math.max(1, r + delta)));
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>{t("leaveReview")}</Text>
      <Text style={styles.subtitle}>{experienceTitle || ""}</Text>

      <View style={styles.ratingRow}>
        <TouchableOpacity style={styles.ratingBtn} onPress={() => changeRating(-1)}>
          <Text style={styles.ratingBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.ratingValue}>{rating.toFixed(0)}</Text>
        <TouchableOpacity style={styles.ratingBtn} onPress={() => changeRating(1)}>
          <Text style={styles.ratingBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.ratingHint}>{t("ratingHint")}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t("reviewPlaceholder")}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t("submit")}</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: "800", color: livadaiColors.primaryText },
  subtitle: { color: livadaiColors.secondaryText, marginBottom: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 12 },
  ratingBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  ratingValue: { fontSize: 20, fontWeight: "800", color: livadaiColors.primaryText },
  ratingHint: { color: livadaiColors.secondaryText },
  input: {
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    color: livadaiColors.primaryText,
    minHeight: 120,
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: livadaiColors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "800" },
});
