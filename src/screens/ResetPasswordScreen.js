import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function ResetPasswordScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(route?.params?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
  const canSubmit = !loading && isPasswordValid && password === confirm && email.trim() && otp.trim().length === 6;

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert("", t("emailRequired"));
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      Alert.alert("", t("otpRequired", { defaultValue: "Introdu codul de 6 cifre" }));
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("", t("passwordRules"));
      return;
    }
    if (password !== confirm) {
      Alert.alert("", t("passwordMismatch", { defaultValue: "Parolele nu coincid" }));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password-otp", {
        email: email.trim(),
        otpCode: otp.trim(),
        password,
        confirmPassword: confirm,
      });
      Alert.alert("", t("passwordResetSuccess", { defaultValue: "Parola a fost resetată. Te poți loga." }), [
        { text: t("login"), onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("resetError", { defaultValue: "Cod expirat sau invalid" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("resetPassword", { defaultValue: "Resetează parola" })}</Text>
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
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
          placeholder={t("otpCode", { defaultValue: "Codul de 6 cifre" })}
          placeholderTextColor="#9ca3af"
        />
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder={t("newPassword", { defaultValue: "Parolă nouă" })}
          placeholderTextColor="#9ca3af"
        />
        <Text style={[styles.hint, isPasswordValid ? styles.hintOk : styles.hintWarn]}>{t("passwordRules")}</Text>
        <TextInput
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
          placeholder={t("confirmPassword", { defaultValue: "Confirmă parola" })}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={[styles.btn, !canSubmit && { opacity: 0.6 }]} onPress={submit} disabled={!canSubmit}>
          <Text style={styles.btnText}>{loading ? t("loading") : t("resetPassword", { defaultValue: "Resetează parola" })}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background, justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: livadaiColors.border },
  title: { fontSize: 22, fontWeight: "900", color: livadaiColors.primary, marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 12,
    padding: 12,
    color: "#0f172a",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  hint: {
    marginTop: -6,
    marginBottom: 10,
    fontSize: 12,
  },
  hintOk: { color: livadaiColors.primary },
  hintWarn: { color: "#ef4444" },
  btn: { backgroundColor: livadaiColors.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
});
