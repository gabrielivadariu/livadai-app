import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { livadaiColors } from "../theme/theme";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../services/api";

export default function BecomeHostScreen({ navigation }) {
  const { t } = useTranslation();
  // Always read context once to avoid undefined destructuring / ReferenceError
  const ctx = useContext(AuthContext) || {};
  const user = ctx.user;
  const becomeHost = ctx.becomeHost;

  // Set up local state even if user is missing (values stay empty)
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("RO");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RO");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .get("/users/me/profile")
      .then((res) => {
        if (!active) return;
        const data = res?.data || {};
        setDisplayName(data.displayName || data.name || "");
        setPhone(data.phone || "");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  // Guard render when user is not present
  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "700" }}>{t("login", { defaultValue: "Autentifică-te" })}</Text>
      </View>
    );
  }

  const onSubmit = async () => {
    if (!displayName.trim() || !bio.trim() || !city.trim() || !country.trim()) {
      Alert.alert("", t("completeRequired", { defaultValue: "Te rugăm să completezi toate câmpurile obligatorii" }));
      return;
    }
    if (!acceptTerms || !confirmInfo) {
      Alert.alert("", t("acceptTermsFirst", { defaultValue: "Confirmă termenii și corectitudinea datelor" }));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        languages: languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim() || user?.phone,
        phoneCountryCode: user?.phoneCountryCode || "+40",
        acceptTerms,
        confirmInfo,
      };
      await becomeHost(payload);
      Alert.alert("", t("hostActivated", { defaultValue: "Felicitări! Acum ești gazdă LIVADAI." }), [
        { text: t("goToHost", { defaultValue: "Mergi la Host Dashboard" }), onPress: () => navigation.navigate("HostTab") },
      ]);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const renderCheckbox = (checked, onPress, label) => (
    <TouchableOpacity style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && { backgroundColor: livadaiColors.primary, borderColor: livadaiColors.primary }]}>
        {checked ? <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, color: "#0f172a" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("becomeHost", { defaultValue: "Devino gazdă" })}</Text>
          <Text style={styles.subtitle}>{t("becomeHostIntro", { defaultValue: "Devino gazdă pe LIVADAI și câștigă oferind experiențe autentice." })}</Text>

          <Text style={styles.label}>{t("publicDisplayName", { defaultValue: "Nume public" })}</Text>
          <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} placeholder={t("publicDisplayName")}
            placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>{t("aboutHost", { defaultValue: "Despre tine" })}</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            multiline
            placeholder={t("aboutHostPlaceholder", { defaultValue: "Scrie câteva rânduri despre tine și experiența ta." })}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>{t("languages", { defaultValue: "Limbi vorbite" })}</Text>
          <TextInput
            value={languages}
            onChangeText={setLanguages}
            style={styles.input}
            placeholder={t("languagesPlaceholder", { defaultValue: "Ex: RO, EN" })}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>{t("city")}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholder={t("city")}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>{t("country")}</Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            style={styles.input}
            placeholder={t("country")}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>{t("phone")}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder={t("phone")}
            placeholderTextColor="#94a3b8"
          />

          {renderCheckbox(acceptTerms, () => setAcceptTerms(!acceptTerms), t("acceptHostTerms", { defaultValue: "Accept Termenii pentru gazde" }))}
          {renderCheckbox(confirmInfo, () => setConfirmInfo(!confirmInfo), t("confirmInfo", { defaultValue: "Confirm că informațiile sunt reale" }))}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.btnText}>{loading ? t("loading") : t("becomeHostCta", { defaultValue: "Devino gazdă" })}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: "900", color: livadaiColors.primary },
  subtitle: { color: "#475569", marginBottom: 6 },
  label: { fontWeight: "700", color: "#0f172a" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: livadaiColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
});
