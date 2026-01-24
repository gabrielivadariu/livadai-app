import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";

export default function DeleteAccountScreen({ navigation }) {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const [step, setStep] = useState("reauth");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    if (!password) {
      Alert.alert("", t("deleteAccountPasswordRequired"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reauth", { password });
      await api.post("/users/me/delete-request", {});
      setStep("otp");
      Alert.alert("", t("deleteAccountCodeSent"));
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("deleteAccountFailed"));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!otp || otp.trim().length !== 6) {
      Alert.alert("", t("deleteAccountOtpRequired"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/me/delete-confirm", { otpCode: otp.trim() });
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("deleteAccountFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("deleteAccount")}</Text>
        <Text style={styles.subtitle}>{t("deleteAccountConfirmBody")}</Text>

        {step === "reauth" ? (
          <>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder={t("deleteAccountPasswordLabel")}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={requestCode} disabled={loading}>
              <Text style={styles.btnText}>{t("deleteAccountSendCode")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              placeholder={t("deleteAccountOtpLabel")}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={confirmDelete} disabled={loading}>
              <Text style={styles.btnText}>{t("deleteAccountConfirmButton")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background, justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: livadaiColors.border },
  title: { fontSize: 22, fontWeight: "900", color: livadaiColors.primary, marginBottom: 8, textAlign: "center" },
  subtitle: { color: livadaiColors.secondaryText, textAlign: "center", marginBottom: 12 },
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
});
