import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import { TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AuthContext } from "../context/AuthContext";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+40");
  const [role, setRole] = useState("EXPLORER");
  const [error, setError] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const countryCodes = [
    { code: "+40", label: "RO" },
    { code: "+1", label: "US/CA" },
    { code: "+44", label: "UK" },
    { code: "+49", label: "DE" },
    { code: "+33", label: "FR" },
    { code: "+34", label: "ES" },
    { code: "+39", label: "IT" },
    { code: "+43", label: "AT" },
    { code: "+41", label: "CH" },
    { code: "+31", label: "NL" },
    { code: "+32", label: "BE" },
    { code: "+420", label: "CZ" },
    { code: "+36", label: "HU" },
    { code: "+48", label: "PL" },
    { code: "+386", label: "SI" },
    { code: "+421", label: "SK" },
    { code: "+372", label: "EE" },
    { code: "+371", label: "LV" },
    { code: "+370", label: "LT" },
    { code: "+47", label: "NO" },
    { code: "+46", label: "SE" },
    { code: "+45", label: "DK" },
    { code: "+353", label: "IE" },
    { code: "+30", label: "GR" },
    { code: "+357", label: "CY" },
    { code: "+356", label: "MT" },
    { code: "+52", label: "MX" },
    { code: "+55", label: "BR" },
    { code: "+54", label: "AR" },
    { code: "+56", label: "CL" },
    { code: "+57", label: "CO" },
    { code: "+51", label: "PE" },
    { code: "+27", label: "ZA" },
    { code: "+61", label: "AU" },
    { code: "+64", label: "NZ" },
    { code: "+81", label: "JP" },
    { code: "+82", label: "KR" },
    { code: "+86", label: "CN" },
    { code: "+852", label: "HK" },
    { code: "+853", label: "MO" },
    { code: "+886", label: "TW" },
    { code: "+60", label: "MY" },
    { code: "+65", label: "SG" },
    { code: "+62", label: "ID" },
    { code: "+63", label: "PH" },
    { code: "+66", label: "TH" },
    { code: "+84", label: "VN" },
    { code: "+91", label: "IN" },
    { code: "+92", label: "PK" },
    { code: "+971", label: "AE" },
    { code: "+972", label: "IL" },
    { code: "+90", label: "TR" },
    { code: "+7", label: "RU/KZ" },
    { code: "+20", label: "EG" },
    { code: "+212", label: "MA" },
    { code: "+216", label: "TN" },
    { code: "+234", label: "NG" },
  ];
  const [codeModal, setCodeModal] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");

  const onSubmit = async () => {
    setError("");
    if (!name || !email || !password || !confirmPassword || !phone || !phoneCode) {
      setError(t("completeRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordsMustMatch", { defaultValue: "Parolele nu coincid" }));
      return;
    }
    if (!/^\d{6,15}$/.test(String(phone))) {
      setError(t("invalidPhone", { defaultValue: "Telefon invalid" }));
      return;
    }
    if (!termsChecked) {
      setError(
        t("termsRequired", {
          defaultValue: i18n.language?.startsWith("ro")
            ? "Trebuie să accepți Termenii și Politica de Confidențialitate."
            : "You must accept the Terms & Conditions and Privacy Policy.",
        })
      );
      return;
    }
    try {
      const registeredUser = await register({
        name,
        email,
        password,
        confirmPassword,
        role,
        phone,
        phoneCountryCode: phoneCode,
        termsAccepted: termsChecked,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: "v1",
      });
      navigation.navigate("VerifyEmail", { email: registeredUser.email });
    } catch (e) {
      setError(e?.response?.data?.message || t("registerFailed"));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.card}>
        <Text style={styles.title}>LIVADAI</Text>
        <Text style={styles.subtitle}>Explorers & Hosts</Text>

        <Text style={styles.label}>{t("role")}</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleButton, role === "EXPLORER" && styles.roleSelected]}
            onPress={() => setRole("EXPLORER")}
          >
            <Text style={[styles.roleText, role === "EXPLORER" && styles.roleTextSelected]}>{t("explorer")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === "HOST" && styles.roleSelected]}
            onPress={() => setRole("HOST")}
          >
            <Text style={[styles.roleText, role === "HOST" && styles.roleTextSelected]}>{t("host")}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          label={t("name")}
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          textColor="#0f172a"
          placeholderTextColor="#94a3b8"
          outlineColor="#e2e8f0"
          activeOutlineColor={livadaiColors.primary}
          theme={{ colors: { primary: livadaiColors.primary, text: "#0f172a", placeholder: "#94a3b8", background: "#fff" } }}
        />
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
        <TextInput
          label={t("confirmPassword", { defaultValue: "Confirmă parola" })}
          mode="outlined"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          textColor="#0f172a"
          placeholderTextColor="#94a3b8"
          outlineColor="#e2e8f0"
          activeOutlineColor={livadaiColors.primary}
          theme={{ colors: { primary: livadaiColors.primary, text: "#0f172a", placeholder: "#94a3b8", background: "#fff" } }}
        />

        <Text style={styles.label}>{t("phone")}</Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.prefixBtn} onPress={() => setCodeModal(true)}>
            <Text style={styles.prefixText}>{phoneCode}</Text>
          </TouchableOpacity>
          <TextInput
            mode="outlined"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            textColor="#0f172a"
            placeholderTextColor="#94a3b8"
            outlineColor="#e2e8f0"
            activeOutlineColor={livadaiColors.primary}
            theme={{ colors: { primary: livadaiColors.primary, text: "#0f172a", placeholder: "#94a3b8", background: "#fff" } }}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.termsText}>
          {i18n.language?.startsWith("ro") ? "Prin crearea unui cont, ești de acord cu " : "By creating an account, you agree to LIVADAI’s "}
          <Text style={styles.termsLink} onPress={() => Linking.openURL("https://sites.google.com/view/terms-conditions-livadai/pagina-de-pornire")}>
            {i18n.language?.startsWith("ro") ? "Termenii și Condițiile" : "Terms & Conditions"}
          </Text>
          {i18n.language?.startsWith("ro") ? " și " : " and "}
          <Text style={styles.termsLink} onPress={() => Linking.openURL("https://sites.google.com/view/privacypolicylivadai/pagina-de-pornire")}>
            {i18n.language?.startsWith("ro") ? "Politica de Confidențialitate" : "Privacy Policy"}
          </Text>
          {i18n.language?.startsWith("ro") ? " LIVADAI." : "."}
        </Text>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsChecked((v) => !v)}>
          <View style={[styles.checkbox, termsChecked && styles.checkboxChecked]}>
            {termsChecked ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxText}>
            {i18n.language?.startsWith("ro")
              ? "Sunt de acord cu Termenii și Condițiile și Politica de Confidențialitate LIVADAI"
              : "I agree to LIVADAI’s Terms & Conditions and Privacy Policy"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} style={{ width: "100%" }} disabled={!termsChecked}>
          <LinearGradient colors={livadaiColors.gradient} style={[styles.button, !termsChecked && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>{t("register")}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 12 }}>
          <Text style={styles.link}>{t("haveAccount")}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Prefix modal */}
      {codeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("countryCode", { defaultValue: "Selectează prefix" })}</Text>
            <TextInput
              mode="outlined"
              value={codeSearch}
              onChangeText={setCodeSearch}
              placeholder="Search"
              style={[styles.input, { marginBottom: 8 }]}
              outlineColor="#e2e8f0"
              activeOutlineColor={livadaiColors.primary}
            />
            <View style={{ maxHeight: "60%" }}>
              <ScrollView>
                {countryCodes
                  .filter((c) => {
                    const q = codeSearch.toLowerCase();
                    return !q || c.label.toLowerCase().includes(q) || c.code.includes(q);
                  })
                  .map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      style={[styles.codeRow, phoneCode === c.code && styles.codeRowActive]}
                      onPress={() => {
                        setPhoneCode(c.code);
                        setCodeModal(false);
                        setCodeSearch("");
                      }}
                    >
                      <Text style={[styles.codeRowText, phoneCode === c.code && styles.codeRowTextActive]}>
                        {c.label} {c.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
            <TouchableOpacity onPress={() => setCodeModal(false)} style={styles.modalClose}>
              <Text style={{ color: livadaiColors.primary, fontWeight: "700" }}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    color: livadaiColors.primary,
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
    color: livadaiColors.accent,
    textAlign: "center",
    fontWeight: "500",
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    color: livadaiColors.secondaryText,
    marginBottom: 6,
  },
  labelSmall: { color: livadaiColors.secondaryText, marginBottom: 4, fontSize: 12 },
  termsText: {
    color: livadaiColors.secondaryText,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  termsLink: {
    color: livadaiColors.primaryText,
    fontWeight: "700",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    borderColor: livadaiColors.primary,
    backgroundColor: "#e0f7fa",
  },
  checkboxMark: {
    color: livadaiColors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  checkboxText: {
    flex: 1,
    color: livadaiColors.primaryText,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  roleRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginRight: 8,
  },
  roleSelected: {
    borderColor: livadaiColors.primary,
    backgroundColor: "#e0f7fa",
  },
  roleText: {
    color: livadaiColors.secondaryText,
  },
  roleTextSelected: {
    color: livadaiColors.primary,
    fontWeight: "bold",
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  prefixBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: livadaiColors.primary,
    backgroundColor: "#e0f2fe",
  },
  prefixText: { color: livadaiColors.primary, fontWeight: "700" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  codeRow: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#e2e8f0" },
  codeRowActive: { backgroundColor: "#f8fafc" },
  codeRowText: { fontSize: 14, color: "#0f172a" },
  codeRowTextActive: { color: livadaiColors.primary, fontWeight: "700" },
  modalClose: { marginTop: 12, alignItems: "flex-end" },
});
