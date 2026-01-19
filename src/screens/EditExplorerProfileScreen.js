import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../constants/languages";

export default function EditExplorerProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [languages, setLanguages] = useState([]);
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [langSearch, setLangSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/me/profile");
        setDisplayName(data?.name || "");
        setAge(data?.age ? String(data.age) : "");
        setLanguages(data?.languages || []);
        setBio(data?.shortBio || "");
        setPhoto(data?.profilePhoto || "");
        setPhone(data?.phone || "");
      } catch (_e) {
        Alert.alert(t("error"), t("loadError", { defaultValue: "Could not load profile" }));
      }
    })();
  }, [t]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!res.canceled && res.assets?.length) {
      const asset = res.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop() || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      });
      setUploadingPhoto(true);
      try {
        const upload = await api.post("/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          transformRequest: () => formData,
        });
        setPhoto(upload.data.url || "");
      } catch (e) {
        Alert.alert(t("error"), e?.response?.data?.message || t("saveError", { defaultValue: "Upload failed" }));
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const toggleLang = (code) => {
    setLanguages((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const filteredLangs = useMemo(() => {
    if (!langSearch.trim()) return [];
    const term = langSearch.trim().toLowerCase();
    return SUPPORTED_LANGUAGES.filter((l) => l.label.toLowerCase().includes(term) || l.code.toLowerCase().includes(term));
  }, [langSearch]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/users/me/profile", {
        displayName: displayName?.trim(),
        age: age ? Number(age) : undefined,
        languages,
        shortBio: bio,
        profilePhoto: photo,
        phone,
      });
      Alert.alert("", t("savedSuccess"));
      navigation.goBack();
    } catch (e) {
      Alert.alert(t("error"), e?.response?.data?.message || t("saveError", { defaultValue: "Could not save profile" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.photoRow} onPress={pickPhoto}>
            <View style={styles.avatar}>
              {photo ? <Ionicons name="image" size={20} color="#fff" /> : <Ionicons name="person" size={22} color="#fff" />}
            </View>
            <Text style={{ color: livadaiColors.primary, fontWeight: "700" }}>{t("changePhoto")}</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.label}>{t("name")}</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} placeholder={t("name")} />

            <Text style={[styles.label, { marginTop: 12 }]}>{t("age")}</Text>
            <TextInput
              value={age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              style={styles.input}
              placeholder={t("age")}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>{t("languages")}</Text>
            {languages.length ? (
              <View style={styles.chipsRow}>
                {languages.map((code) => (
                  <TouchableOpacity key={code} style={[styles.chip, styles.chipActive]} onPress={() => toggleLang(code)}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>{code.toUpperCase()}</Text>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={{ color: "#94a3b8", marginBottom: 6 }}>{t("noLanguageSelected")}</Text>
            )}
            <TextInput
              value={langSearch}
              onChangeText={setLangSearch}
              style={[styles.input, { marginBottom: 10 }]}
              placeholder={t("searchLanguage")}
            />
            {langSearch.trim().length > 0 ? (
              <View style={{ gap: 6 }}>
                {filteredLangs.map((item) => {
                  const active = languages.includes(item.code);
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[styles.langRow, active && { borderColor: livadaiColors.primary, backgroundColor: "#e0f7fa" }]}
                      onPress={() => toggleLang(item.code)}
                    >
                      <Text style={{ fontWeight: "700", color: "#0f172a" }}>{item.label}</Text>
                      <Text style={{ color: "#475569" }}>{item.code.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
                {filteredLangs.length === 0 ? <Text style={{ color: "#94a3b8" }}>{t("noResults", { defaultValue: "No results" })}</Text> : null}
              </View>
            ) : null}

            <Text style={[styles.label, { marginTop: 12 }]}>{t("phone")}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="+40 712 345 678"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>{t("shortBio")}</Text>
            <TextInput
              value={bio}
              onChangeText={(v) => setBio(v.slice(0, 200))}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              placeholder={t("shortBio")}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, (saving || uploadingPhoto) && { opacity: 0.6 }]}
            onPress={saveProfile}
            disabled={saving || uploadingPhoto}
          >
            <Text style={styles.saveText}>{t("save")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { color: "#475569", marginBottom: 6, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  saveBtn: {
    backgroundColor: livadaiColors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800" },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  chipActive: { backgroundColor: livadaiColors.primary, borderColor: livadaiColors.primary },
});
