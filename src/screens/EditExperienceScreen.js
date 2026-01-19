import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export default function EditExperienceScreen({ route, navigation }) {
  const initialExp = route.params?.experience;
  const { t } = useTranslation();
  const [exp, setExp] = useState(initialExp || null);
  const [loading, setLoading] = useState(!initialExp);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialExp && route.params?.id) {
      (async () => {
        try {
          const { data } = await api.get(`/experiences/${route.params.id}`);
          setExp(data);
        } catch (e) {
          setError(t("experienceLoadFailed", { defaultValue: "Nu s-a putut încărca experiența" }));
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [initialExp, route.params, t]);

  const onChange = (key, value) => setExp((prev) => ({ ...prev, [key]: value }));

  const pickCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("", t("mediaPermission"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || "image.jpg",
      type: asset.type || "image/jpeg",
    });
    try {
      const { data } = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange("mainImageUrl", data?.url || data?.path || asset.uri);
    } catch (_e) {
      Alert.alert("", t("uploadFailed"));
    }
  };

  const onSubmit = async () => {
    if (!exp) return;
    if (exp.shortDescription && exp.shortDescription.length > 50) {
      Alert.alert("", t("shortDescriptionMax"));
      return;
    }
    if (!exp.title) {
      Alert.alert("", t("fieldRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: exp.title,
        shortDescription: exp.shortDescription,
        description: exp.description,
        mainImageUrl: exp.mainImageUrl,
      };
      await api.patch(`/experiences/${exp._id}`, payload);
      navigation.goBack();
    } catch (e) {
      setError(t("experienceSaveFailed", { defaultValue: "Nu s-a putut salva experiența" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!exp) return <Text style={{ padding: 16 }}>{t("notFound")}</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={styles.screenTitle}>{t("editExperience")}</Text>
      <Text style={styles.helper}>
        {t("editLockedInfo", {
          defaultValue: "Anumite detalii nu mai pot fi modificate după publicare (preț, durată, categorie, locație).",
        })}
      </Text>

      {/* Basic Info */}
      <View style={styles.card}>
        <Text style={styles.label}>{t("experienceTitleLabel")}</Text>
        <TextInput
          style={styles.input}
          value={exp.title || ""}
          placeholder={t("experienceTitlePlaceholder")}
          onChangeText={(v) => onChange("title", v)}
        />
        <Text style={styles.helper}>{t("experienceTitleHelper")}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>{t("shortDescriptionLabel")}</Text>
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            value={exp.shortDescription || ""}
            placeholder={t("shortDescriptionPlaceholder")}
            maxLength={50}
            onChangeText={(v) => onChange("shortDescription", v.slice(0, 50))}
          />
          <Text style={styles.counter}>{(exp.shortDescription || "").length}/50</Text>
        </View>
        <Text style={styles.helper}>{t("shortDescriptionHelper")}</Text>
      </View>

      {/* Images */}
      <View style={styles.card}>
        <Text style={styles.label}>{t("imagesLabel")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
          <View style={styles.coverPreview}>
            {exp.mainImageUrl ? (
              <Image source={{ uri: exp.mainImageUrl }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Ionicons name="image" size={24} color="#94a3b8" />
            )}
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={pickCover}>
            <Text style={styles.primaryText}>{t("changePhoto")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={{ color: "#dc2626" }}>{error}</Text> : null}

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSubmit} disabled={saving}>
        <Text style={styles.saveText}>{saving ? t("saving", { defaultValue: "Se salvează..." }) : t("save")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: { fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  helper: { color: "#6b7280", fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  counter: { position: "absolute", right: 10, bottom: 8, color: "#6b7280", fontSize: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: livadaiColors.primary, backgroundColor: "#e0f2fe" },
  chipText: { color: "#334155", fontWeight: "600" },
  chipTextActive: { color: livadaiColors.primary },
  coverPreview: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryBtn: {
    backgroundColor: livadaiColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
  },
  secondaryText: { color: "#ef4444", fontWeight: "800" },
  saveBtn: {
    marginTop: 12,
    backgroundColor: livadaiColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
