import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert("", t("emailRequired"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password-otp", { email: email.trim() });
      Alert.alert("", t("resetEmailSent", { defaultValue: "Dacă există un cont cu acest email, vei primi un cod de resetare." }));
      navigation.navigate("ResetPassword", { email: email.trim() });
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("resetError", { defaultValue: "Nu am putut trimite codul" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("resetPasswordTitle", { defaultValue: "Resetare parolă" })}</Text>
        <Text style={styles.subtitle}>
          {t("resetInstructionFriendly", { defaultValue: "Introdu adresa de email pentru a primi codul de resetare." })}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder={t("email")}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? t("loading") : t("sendLink", { defaultValue: "Trimite link" })}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={styles.link}>{t("backToLogin", { defaultValue: "Înapoi la login" })}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background, justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: livadaiColors.border },
  title: { fontSize: 22, fontWeight: "900", color: livadaiColors.primary, marginBottom: 8, textAlign: "center" },
  subtitle: { color: "#475569", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 12,
    padding: 12,
    color: "#0f172a",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  btn: { backgroundColor: livadaiColors.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
  link: { color: livadaiColors.primary, textAlign: "center", fontWeight: "700" },
});
