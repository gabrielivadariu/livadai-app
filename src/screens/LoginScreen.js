import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AuthContext } from "../context/AuthContext";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setError("");
    try {
      await login(email, password);
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.card}>
        <Text style={styles.title}>LIVADAI</Text>
        <Text style={styles.subtitle}>{t("loginSubtitle", { defaultValue: "Explorers & Hosts" })}</Text>

        <TextInput
          label={t("email")}
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          textColor="#0f172a"
          placeholderTextColor="#94a3b8"
          outlineColor="#e2e8f0"
          activeOutlineColor={livadaiColors.primary}
          theme={{ colors: { primary: livadaiColors.primary, text: "#0f172a", placeholder: "#94a3b8", background: "#fff" } }}
        />
        <TextInput
          label={t("password")}
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          textColor="#0f172a"
          placeholderTextColor="#94a3b8"
          outlineColor="#e2e8f0"
          activeOutlineColor={livadaiColors.primary}
          theme={{ colors: { primary: livadaiColors.primary, text: "#0f172a", placeholder: "#94a3b8", background: "#fff" } }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} style={{ width: "100%" }}>
          <LinearGradient colors={livadaiColors.gradient} style={styles.button}>
            <Text style={styles.buttonText}>{t("login")}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 12 }}>
          <Text style={styles.link}>
            <Text style={styles.linkText}>{t("noAccountQuestion", { defaultValue: "Nu ai cont?" })} </Text>
            <Text style={styles.linkPrimary}>{t("register", { defaultValue: "Înregistrează-te" })}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{ marginTop: 8 }}>
          <Text style={[styles.link, { color: livadaiColors.primary }]}>{t("forgotPassword", { defaultValue: "Ți-ai uitat parola?" })}</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: livadaiColors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    backgroundColor: livadaiColors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: livadaiColors.border,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: livadaiColors.primary, // turcoaz livadai
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    fontWeight: "500",
    color: livadaiColors.accent,
  },
  linkText: {
    color: livadaiColors.accent,
  },
  linkPrimary: {
    color: livadaiColors.primary,
    fontWeight: "700",
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 8,
    textAlign: "center",
  },
});
