import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { livadaiColors } from "../theme/theme";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import { emitRefreshHostProfile } from "../utils/eventBus";
import { AuthContext } from "../context/AuthContext";
import ScreenHeader from "../components/ScreenHeader";

export default function EditHostProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const { t } = useTranslation();
  const { saveAuth } = useContext(AuthContext);

  const load = async () => {
    try {
      const { data } = await api.get("/hosts/me/profile");
      const normalizedLangs = Array.isArray(data?.languages)
        ? data.languages
        : typeof data?.languages === "string" && data.languages.trim()
        ? data.languages
            .split(/[;,\\s]+/)
            .map((l) => l.toLowerCase())
            .filter(Boolean)
        : [];
      setProfile({
        ...(data || {}),
        languages: normalizedLangs,
        experience: data?.experience || data?.experienceDescription || "",
        about_me: data?.about_me || data?.shortBio || "",
      });
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
    if (res.canceled || !res.assets) return;
    const asset = res.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || asset.uri.split("/").pop() || "avatar.jpg",
      type: asset.mimeType || "image/jpeg",
    });
    setUploadingAvatar(true);
    try {
      const upload = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: () => formData,
      });
      onChange("avatar", upload.data.url || "");
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("saveFailed"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await api.put("/hosts/me/profile", {
        ...profile,
        languages: profile.languages || [],
        experience: profile.experience || "",
        experienceDescription: profile.experience || "",
        about_me: profile.about_me || "",
      });
      try {
        const meRes = await api.get("/auth/me");
        if (meRes?.data?.user) {
          await saveAuth(meRes.data.user, null);
        }
      } catch (_e) {}
      Alert.alert("", t("profileUpdated"));
      // re-fetch profile after save
      await load();
      emitRefreshHostProfile();
      navigation.goBack();
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("editProfile")} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 }} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.avatarRow} onPress={pickAvatar}>
              <Image source={{ uri: profile.avatar || "https://via.placeholder.com/80" }} style={styles.avatar} />
              <Text style={styles.link}>{t("changeAvatar")}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t("displayName")}</Text>
            <TextInput style={styles.input} value={profile.display_name || ""} onChangeText={(v) => onChange("display_name", v)} />

            <Text style={styles.label}>{t("age")}</Text>
            <TextInput style={styles.input} value={profile.age ? String(profile.age) : ""} onChangeText={(v) => onChange("age", v)} keyboardType="numeric" />

            <Text style={styles.label}>{t("city")}</Text>
            <TextInput style={styles.input} value={profile.city || ""} onChangeText={(v) => onChange("city", v)} />

            <Text style={styles.label}>{t("country")}</Text>
            <TextInput style={styles.input} value={profile.country || ""} onChangeText={(v) => onChange("country", v)} />

            <Text style={styles.label}>{t("phone")}</Text>
            <TextInput
              style={styles.input}
              value={profile.phone || ""}
              onChangeText={(v) => onChange("phone", v)}
              keyboardType="phone-pad"
              placeholder="+40 712 345 678"
            />

            <Text style={styles.label}>{t("experienceLabel")}</Text>
            <TextInput
              style={styles.input}
              value={profile.experience || ""}
              onChangeText={(v) => onChange("experience", v)}
              placeholder={t("experiencePlaceholder")}
            />

            <Text style={styles.label}>{t("languagesLabel")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {profile.languages?.length ? (
                profile.languages.map((code) => (
                  <View key={code} style={styles.chipActive}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>{code.toUpperCase()}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#6b7280" }}>{t("noLanguageSelected")}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => setLanguageModal(true)}>
              <Text style={styles.outlineText}>{t("selectLanguages")}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t("hostAboutMe")}</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              multiline
              value={profile.about_me || ""}
              onChangeText={(v) => onChange("about_me", v)}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving || uploadingAvatar}>
              <Text style={styles.saveText}>{saving ? t("saving") : t("save")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal visible={languageModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
          <View style={{ padding: 16, gap: 12, flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>{t("selectLanguages")}</Text>
            <TextInput
              placeholder={t("searchLanguage")}
              value={langSearch}
              onChangeText={setLangSearch}
              style={[styles.input, { borderRadius: 12 }]}
              placeholderTextColor={"#9ca3af"}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {profile.languages?.map((code) => (
                <TouchableOpacity
                  key={code}
                  style={styles.chipActive}
                  onPress={() =>
                    onChange(
                      "languages",
                      (profile.languages || []).filter((c) => c !== code)
                    )
                  }
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{code.toUpperCase()} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
            <FlatList
              data={SUPPORTED_LANGUAGES.filter(
                (l) => l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.code.toLowerCase().includes(langSearch.toLowerCase())
              )}
              keyExtractor={(item) => item.code}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />}
              renderItem={({ item }) => {
                const selected = (profile.languages || []).includes(item.code);
                return (
                  <TouchableOpacity
                    style={{ paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                    onPress={() => {
                      if (selected) {
                        onChange(
                          "languages",
                          (profile.languages || []).filter((c) => c !== item.code)
                        );
                      } else {
                        onChange("languages", [...(profile.languages || []), item.code]);
                      }
                    }}
                  >
                    <View>
                      <Text style={{ fontWeight: "700", color: "#0f172a" }}>{item.label}</Text>
                      <Text style={{ color: "#6b7280", fontSize: 12 }}>{item.code.toUpperCase()}</Text>
                    </View>
                    {selected ? <Text style={{ color: livadaiColors.primary, fontWeight: "800" }}>✓</Text> : null}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={() => setLanguageModal(false)}>
              <Text style={styles.saveText}>{t("done") || "Gata"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background },
  title: { fontSize: 20, fontWeight: "800", color: livadaiColors.primaryText, marginBottom: 12 },
  label: { marginTop: 10, marginBottom: 4, color: livadaiColors.secondaryText, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    color: livadaiColors.primaryText,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#e5e7eb" },
  link: { color: livadaiColors.primary, fontWeight: "700" },
  saveBtn: { marginTop: 20, backgroundColor: livadaiColors.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: livadaiColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  outlineText: { color: livadaiColors.primary, fontWeight: "800" },
  chipActive: {
    backgroundColor: livadaiColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
