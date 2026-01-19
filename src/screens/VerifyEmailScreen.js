import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function VerifyEmailScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(route?.params?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert("", t("emailRequired"));
      return;
    }
    if (!code.trim() || code.trim().length !== 6) {
      Alert.alert("", t("otpRequired", { defaultValue: "Introdu codul de 6 cifre" }));
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-email", { email: email.trim(), code: code.trim() });
      // loghează userul după verificare
      if (data.token && data.user) {
        // salvăm în AuthContext prin login shortcut? nu avem acces aici, deci folosim api default headers și navigăm la Login
        Alert.alert("", t("emailVerified", { defaultValue: "Email verificat. Te poți autentifica." }), [
          { text: t("login"), onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("", t("emailVerified", { defaultValue: "Email verificat. Te poți autentifica." }), [
          { text: t("login"), onPress: () => navigation.navigate("Login") },
        ]);
      }
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("otpInvalid", { defaultValue: "Cod invalid sau expirat" }));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      Alert.alert("", t("emailRequired"));
      return;
    }
    setResending(true);
    try {
      await api.post("/auth/resend-email-verification", { email: email.trim() });
      Alert.alert("", t("verificationSent", { defaultValue: "Am trimis din nou codul." }));
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("resetError", { defaultValue: "Nu am putut trimite codul" }));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("verifyEmailTitle", { defaultValue: "Verifică emailul" })}</Text>
        <Text style={styles.subtitle}>
          {t("verifyEmailSubtitle", { defaultValue: "Introdu codul de 6 cifre trimis pe adresa ta de email." })}
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
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
          placeholder={t("otpCode", { defaultValue: "Codul de 6 cifre" })}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? t("loading") : t("verify", { defaultValue: "Verifică" })}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 10 }} onPress={resend} disabled={resending}>
          <Text style={styles.link}>{resending ? t("loading") : t("resendCode", { defaultValue: "Trimite din nou codul" })}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 4 }} onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.link, { color: livadaiColors.accent }]}>{t("backToLogin", { defaultValue: "Înapoi la login" })}</Text>
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
