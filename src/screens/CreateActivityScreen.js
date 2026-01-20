import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import { useTranslation } from "react-i18next";

const currencyOptions = ["RON"];
const activityOptions = [
  { key: "INDIVIDUAL", label: "individual" },
  { key: "GROUP", label: "group" },
];


const initialForm = {
  title: "",
  shortDescription: "",
  longDescription: "",
  price: "",
  currencyCode: "RON",
  activityType: "INDIVIDUAL",
  maxParticipants: 1,
  environment: "OUTDOOR",
  startsAt: null,
  endsAt: null,
  durationMinutes: "",
  country: "Romania",
  countryCode: "RO",
  city: "",
  street: "",
  streetNumber: "",
  languages: [],
  locationLat: null,
  locationLng: null,
};

export default function CreateActivityScreen({ navigation }) {
  return <ExperienceCreateWizard navigation={navigation} />;
}

function ExperienceCreateWizard({ navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [confirmSafe, setConfirmSafe] = useState(false);
  const [pricingMode, setPricingMode] = useState("PAID");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [customCountry, setCustomCountry] = useState("");
  const [scheduleModal, setScheduleModal] = useState({ open: false, field: "start" });
  const [tempDate, setTempDate] = useState(new Date());
  const [scheduleHint, setScheduleHint] = useState("");
  const [languageModal, setLanguageModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [showErrors, setShowErrors] = useState({ 1: false, 2: false, 3: false });
  const [stripeGate, setStripeGate] = useState({ blocked: false, message: "" });

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    // verify stripe status before allowing creation
    (async () => {
      try {
        const { data } = await api.get("/stripe/debug/host-status");
        const payoutsEnabled = data?.payouts_enabled ?? data?.isStripePayoutsEnabled;
        const acct = data?.stripeAccountId;
        if (!acct) {
          setStripeGate({
            blocked: true,
            message: "Pentru a crea experiențe, trebuie să îți conectezi și activezi portofelul Stripe.",
          });
        } else {
          setStripeGate({ blocked: false, message: "" });
        }
      } catch (e) {
        setStripeGate({
          blocked: true,
          message: "Pentru a crea experiențe, trebuie să îți conectezi și activezi portofelul Stripe.",
        });
      }
    })();
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!addressQuery || addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      (async () => {
        try {
          const { data } = await api.get("/geo/search", { params: { query: addressQuery } });
          setSuggestions(data || []);
        } catch (_err) {
          setSuggestions([]);
        }
      })();
    }, 300);
    return () => clearTimeout(timer);
  }, [addressQuery]);

  const selectSuggestion = async (s) => {
    setAddressQuery(s.label);
    setSuggestions([]);
    const isRomania = s.countryCode === "RO" || (s.country || "").toLowerCase().includes("rom");
    const nextCountryCode = isRomania ? "RO" : s.countryCode || "NON_RO";
    if (!isRomania) {
      Alert.alert("", t("countryRoOnly"));
    }
    let coords = { lat: s.lat, lng: s.lng };
    if (!coords.lat || !coords.lng) {
      try {
        const { data } = await api.get("/geo/search", { params: { query: s.label } });
        if (data?.length) {
          coords = { lat: data[0].lat, lng: data[0].lng };
        }
      } catch (_e) {}
    }
    const valid = coords.lat && coords.lng && nextCountryCode === "RO";
    setLatLng(valid ? coords : { lat: null, lng: null });
    setForm((f) => ({
      ...f,
      country: s.country || f.country,
      countryCode: nextCountryCode,
      city: s.city || f.city,
      street: s.street || f.street,
      streetNumber: s.streetNumber || f.streetNumber,
      locationLat: valid ? coords.lat : null,
      locationLng: valid ? coords.lng : null,
    }));
    if (!valid && nextCountryCode === "RO") {
      Alert.alert("", t("completeAddress"));
    }
  };

  const ensureMediaPermission = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("", t("mediaPermission"));
      return false;
    }
    return true;
  };

  const uploadFile = async (asset) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop() || "upload",
        type: asset.mimeType || (asset.type === "video" ? "video/mp4" : "image/jpeg"),
      });
      const { data } = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: () => formData,
      });
      return data.url;
    } catch (_e) {
      Alert.alert("", _e?.response?.data?.message || t("uploadFailed"));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const pickCover = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.canceled || !res.assets) return;
    const url = await uploadFile(res.assets[0]);
    if (url) setCoverImageUrl(url);
  };

  const pickImages = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (res.canceled || !res.assets) return;
    for (const asset of res.assets) {
      const url = await uploadFile(asset);
      if (url) setImages((prev) => [...prev, url]);
    }
  };

  const pickVideo = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: false,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.canceled || !res.assets) return;
    const url = await uploadFile(res.assets[0]);
    if (url) setVideoUrl(url);
  };

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : t("selectDateTime");

  const basicErrors = useMemo(() => {
    const errors = {};
    if (!form.title.trim()) errors.title = t("fieldRequired");
    return errors;
  }, [form.title]);

  const scheduleErrors = useMemo(() => {
    const errors = {};
    if (!form.startsAt) errors.startsAt = t("fieldRequired");
    const hasDuration = form.durationMinutes && Number(form.durationMinutes) > 0;
    if (!form.endsAt && !hasDuration) errors.endsAt = t("scheduleRequired");
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      errors.endsAt = t("endAfterStart");
    }
    if (form.durationMinutes && Number(form.durationMinutes) <= 0) {
      errors.durationMinutes = t("durationInvalid");
    }
    return errors;
  }, [form.durationMinutes, form.endsAt, form.startsAt, t]);

  const pricingErrors = useMemo(() => {
    const errors = {};
    if (pricingMode === "PAID" && (!form.price || Number(form.price) <= 0)) errors.price = t("fieldRequired");
    if (!form.currencyCode) errors.currencyCode = t("fieldRequired");
    if (!confirmSafe) errors.confirmSafe = t("fieldRequired");
    return errors;
  }, [confirmSafe, form.currencyCode, form.price, pricingMode]);

  const isStepValid = (currentStep) => {
    if (currentStep === 1) return Object.keys(basicErrors).length === 0;
    if (currentStep === 2) return Object.keys(scheduleErrors).length === 0;
    if (currentStep === 3) return Object.keys(pricingErrors).length === 0;
    return false;
  };

  const goNext = () => {
    if (stripeGate.blocked) {
      Alert.alert(t("stripeConnectTitle"), stripeGate.message, [
        { text: t("cancel"), style: "cancel" },
        { text: t("stripeConnectTitle"), onPress: goToWallet },
      ]);
      return;
    }
    const valid = isStepValid(step);
    if (!valid) {
      setShowErrors((prev) => ({ ...prev, [step]: true }));
      return;
    }
    setShowErrors((prev) => ({ ...prev, [step]: false }));
    if (step < 3) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const openScheduleModal = (field) => {
    const base =
      field === "start"
        ? form.startsAt
          ? new Date(form.startsAt)
          : new Date()
        : form.endsAt
          ? new Date(form.endsAt)
          : form.startsAt
            ? new Date(form.startsAt)
            : new Date();
    setTempDate(base);
    setScheduleModal({ open: true, field });
  };

  const applySchedule = () => {
    const targetKey = scheduleModal.field === "start" ? "startsAt" : "endsAt";
    const start = targetKey === "startsAt" ? tempDate : form.startsAt ? new Date(form.startsAt) : tempDate;
    let end = targetKey === "endsAt" ? tempDate : form.endsAt ? new Date(form.endsAt) : null;

    if (targetKey === "startsAt") {
      onChange("startsAt", tempDate.toISOString());
      if (!end) {
        const nextEnd = new Date(tempDate);
        nextEnd.setHours(nextEnd.getHours() + 1);
        onChange("endsAt", nextEnd.toISOString());
        setScheduleHint(t("endAutoAdjusted"));
      } else if (end <= tempDate) {
        const nextEnd = new Date(tempDate);
        nextEnd.setHours(nextEnd.getHours() + 1);
        onChange("endsAt", nextEnd.toISOString());
        setScheduleHint(t("endAdjustedAfterStart"));
      } else {
        setScheduleHint("");
      }
    } else {
      if (tempDate <= start) {
        const nextEnd = new Date(start);
        nextEnd.setHours(nextEnd.getHours() + 1);
        onChange("endsAt", nextEnd.toISOString());
        setScheduleHint(t("endAdjustedAfterStart"));
      } else {
        onChange("endsAt", tempDate.toISOString());
        setScheduleHint("");
      }
    }
    setScheduleModal({ open: false, field: "start" });
  };

  const onSubmit = async () => {
    if (stripeGate.blocked) {
      Alert.alert(t("stripeConnectTitle"), stripeGate.message, [
        { text: t("cancel"), style: "cancel" },
        { text: t("stripeConnectTitle"), onPress: goToWallet },
      ]);
      return;
    }
    if (form.countryCode && form.countryCode !== "RO") {
      Alert.alert("", t("countryRoOnly"));
      return;
    }
    const step1Valid = isStepValid(1);
    const step2Valid = isStepValid(2);
    const step3Valid = isStepValid(3);
    if (!step1Valid || !step2Valid || !step3Valid) {
      setShowErrors({ 1: !step1Valid, 2: !step2Valid, 3: !step3Valid });
      Alert.alert("", t("completeRequired"));
      return;
    }
    if (form.activityType === "GROUP" && (!form.maxParticipants || Number(form.maxParticipants) <= 0)) {
      Alert.alert("", t("setMaxParticipants"));
      return;
    }

    setLoading(true);
    try {
      const fullAddress = [form.street, form.streetNumber, form.city, form.country].filter(Boolean).join(", ");

    const coords = { ...latLng };
      if (!coords.lat || !coords.lng) {
        Alert.alert("", t("completeAddress"));
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.longDescription,
        price: form.price ? Number(form.price) : 0,
        currencyCode: "RON",
        activityType: form.activityType,
        maxParticipants: form.activityType === "GROUP" ? Number(form.maxParticipants) : 1,
        environment: form.environment || "OUTDOOR",
        startsAt: form.startsAt,
        endsAt: form.endsAt || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        country: form.country || "Romania",
        countryCode: form.countryCode || "RO",
        city: form.city,
        street: form.street,
        streetNumber: form.streetNumber,
        address: fullAddress,
        latitude: coords.lat ?? 0,
        longitude: coords.lng ?? 0,
        locationLat: coords.lat ?? null,
        locationLng: coords.lng ?? null,
        images,
        videos: videoUrl ? [videoUrl] : [],
        coverImageUrl,
        mainImageUrl: images[0],
        category: "OUTDOOR",
        languages: form.languages,
      };

      await api.post("/experiences", payload);
      Alert.alert("", t("activityCreated"));
      navigation.goBack();
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("creationError"));
    } finally {
      setLoading(false);
    }
  };

  const tabBarHeight = useBottomTabBarHeight();

  const goToWallet = () => {
    navigation.navigate("HostTab", { screen: "HostWallet" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb", paddingTop: insets.top }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 56 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {t("step")} {step}/3
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
              </View>
              <Text style={styles.progressTitle}>
                {step === 1 ? t("basics") : step === 2 ? t("whenWhere") : t("pricingMedia")}
              </Text>
            </View>

            {stripeGate.blocked ? (
              <View style={styles.stripeGateCard}>
                <Text style={styles.stripeGateTitle}>{t("stripeConnectTitle")}</Text>
                <Text style={styles.stripeGateBody}>{stripeGate.message}</Text>
                <TouchableOpacity style={styles.stripeGateBtn} onPress={goToWallet}>
                  <Text style={styles.stripeGateBtnText}>Mergi la Portofel / Conectează Stripe</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {step === 1 && (
              <StepBasics
                form={form}
                t={t}
                coverImageUrl={coverImageUrl}
                onChange={onChange}
                pickCover={pickCover}
                activityOptions={activityOptions}
                selectedLanguageLabels={SUPPORTED_LANGUAGES.filter((l) => form.languages.includes(l.code))}
                openLanguageModal={() => setLanguageModal(true)}
                errors={basicErrors}
                showErrors={showErrors[1]}
              />
            )}

            {step === 2 && (
              <StepWhenWhere
                t={t}
                form={form}
                onChange={onChange}
                addressQuery={addressQuery}
                setAddressQuery={setAddressQuery}
                suggestions={suggestions}
                selectSuggestion={selectSuggestion}
                latLng={latLng}
                customCountry={customCountry}
                setCustomCountry={setCustomCountry}
                openSchedule={openScheduleModal}
                formatDateTime={formatDateTime}
                errors={scheduleErrors}
                showErrors={showErrors[2]}
                scheduleHint={scheduleHint}
              />
            )}

            {step === 3 && (
              <StepPricingMedia
                t={t}
                form={form}
                onChange={onChange}
        currencyOptions={currencyOptions}
        pickImages={pickImages}
        pickVideo={pickVideo}
        uploading={uploading}
        images={images}
        videoUrl={videoUrl}
        confirmSafe={confirmSafe}
        setConfirmSafe={setConfirmSafe}
        activityOptions={activityOptions}
        errors={pricingErrors}
        showErrors={showErrors[3]}
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
              />
            )}
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.secondaryBtn, step === 1 && styles.disabledBtn]}
              onPress={goBack}
              disabled={step === 1}
            >
              <Text style={[styles.secondaryBtnText, step === 1 && styles.disabledText]}>{t("back")}</Text>
            </TouchableOpacity>
            {step < 3 ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
                <Text style={styles.primaryBtnText}>{t("next")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabledBtn]} onPress={onSubmit} disabled={loading}>
                <Text style={[styles.primaryBtnText, loading && styles.disabledText]}>
                  {loading ? t("posting") : t("postActivity")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {scheduleModal.open && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setScheduleModal({ open: false, field: "start" })}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {scheduleModal.field === "start" ? t("selectStart") : t("selectEnd")}
              </Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => {
                  if (date) {
                    const next = new Date(tempDate);
                    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    setTempDate(next);
                  }
                }}
                style={{ marginBottom: 10 }}
              />
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={(_, date) => {
                  if (date) {
                    const next = new Date(tempDate);
                    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
                    setTempDate(next);
                  }
                }}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setScheduleModal({ open: false, field: "start" })}>
                  <Text style={styles.modalBtnText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={applySchedule}>
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>{t("save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={languageModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: "800" }}>{t("selectLanguages")}</Text>
                <TouchableOpacity onPress={() => setLanguageModal(false)}>
                  <Ionicons name="close" size={26} color="#0f172a" />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder={t("searchLanguage")}
                value={langSearch}
                onChangeText={setLangSearch}
                style={[styles.input, { marginBottom: 14, paddingVertical: 14, borderRadius: 14 }]}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
              data={
                langSearch.trim()
                  ? SUPPORTED_LANGUAGES.filter((l) =>
                      [l.label, l.code].some((val) => val.toLowerCase().includes(langSearch.trim().toLowerCase()))
                    )
                  : SUPPORTED_LANGUAGES
              }
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const active = form.languages.includes(item.code);
                return (
                  <TouchableOpacity
                    style={[
                      styles.langRow,
                      active && { backgroundColor: "#e0f7fa", borderColor: livadaiColors.primary },
                      { paddingVertical: 14, borderRadius: 14 },
                    ]}
                    onPress={() =>
                      setForm((f) => {
                        const exists = f.languages.includes(item.code);
                        return { ...f, languages: exists ? f.languages.filter((c) => c !== item.code) : [...f.languages, item.code] };
                      })
                    }
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      <View style={styles.langBadge}>
                        <Text style={{ fontWeight: "700", color: "#0f172a" }}>{item.code.toUpperCase()}</Text>
                      </View>
                      <Text style={{ fontWeight: "700", color: "#0f172a", flexShrink: 1 }}>{item.label}</Text>
                    </View>
                    {active ? <Ionicons name="checkmark-circle" size={22} color={livadaiColors.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              keyboardShouldPersistTaps="handled"
            />

            <TouchableOpacity
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: (insets.bottom || 0) + 8,
                backgroundColor: livadaiColors.primary,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
              }}
              onPress={() => setLanguageModal(false)}
            >
              <Text style={[styles.primaryBtnText, { fontSize: 18 }]}>{t("done")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StepBasics({
  t,
  form,
  onChange,
  coverImageUrl,
  pickCover,
  activityOptions,
  selectedLanguageLabels,
  openLanguageModal,
  errors,
  showErrors,
}) {
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("coverPhoto")}</Text>
        <TouchableOpacity style={styles.coverCard} onPress={pickCover}>
          {coverImageUrl ? (
            <View style={{ flex: 1 }}>
              <Image source={{ uri: coverImageUrl }} style={styles.coverImage} />
              <View style={styles.coverOverlay}>
                <Ionicons name="image" size={18} color="#fff" />
                <Text style={styles.coverOverlayText}>{t("changePhoto")}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image" size={30} color={livadaiColors.primary} />
              <Text style={styles.coverText}>{t("addCoverPhoto")}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("basics")}</Text>
        <TextInput
          placeholder={t("activityTitlePlaceholder")}
          value={form.title}
          onChangeText={(v) => onChange("title", v)}
          style={styles.input}
          placeholderTextColor={"#9ca3af"}
        />
        {showErrors && errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

        <View style={{ gap: 4 }}>
          <Text style={styles.label}>{t("shortDescriptionLabel")}</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              placeholder={t("shortDescriptionPlaceholder")}
              value={form.shortDescription}
              onChangeText={(v) => onChange("shortDescription", v.slice(0, 50))}
              style={styles.input}
              placeholderTextColor={"#9ca3af"}
              maxLength={50}
              multiline={false}
            />
            <Text style={styles.counter}>{`${(form.shortDescription || "").length}/50`}</Text>
          </View>
        </View>

        <TextInput
          placeholder={t("fullDescriptionPlaceholder")}
          value={form.longDescription}
          onChangeText={(v) => onChange("longDescription", v)}
          style={[styles.input, { height: 140, textAlignVertical: "top" }]}
          multiline
          placeholderTextColor={"#9ca3af"}
        />

        <Text style={[styles.label, { marginTop: 4 }]}>{t("activityType")}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {activityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, form.activityType === opt.key && styles.chipActive]}
              onPress={() => onChange("activityType", opt.key)}
            >
              <Text style={{ color: form.activityType === opt.key ? "#fff" : "#0f172a" }}>{t(opt.label)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {form.activityType === "GROUP" ? (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>{t("maxParticipantsLabel")}</Text>
            <TextInput
              placeholder={t("setMaxParticipants")}
              value={String(form.maxParticipants || "")}
              onChangeText={(v) => onChange("maxParticipants", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor={"#9ca3af"}
            />
            {showErrors && (!form.maxParticipants || Number(form.maxParticipants) <= 0) ? (
              <Text style={styles.errorText}>{t("setMaxParticipants")}</Text>
            ) : null}
          </>
        ) : null}

        <Text style={[styles.label, { marginTop: 12 }]}>{t("environmentLabel", { defaultValue: "Environment" })}</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "INDOOR", label: t("envIndoor") },
            { key: "OUTDOOR", label: t("envOutdoor") },
            { key: "BOTH", label: t("envBoth") },
          ].map((env) => (
            <TouchableOpacity
              key={env.key}
              style={[styles.chip, form.environment === env.key && styles.chipActive]}
              onPress={() => onChange("environment", env.key)}
            >
              <Text style={{ color: form.environment === env.key ? "#fff" : "#0f172a" }}>{env.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("languages")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {selectedLanguageLabels.length ? (
            selectedLanguageLabels.map((l) => (
              <View key={l.code} style={[styles.chip, styles.chipActive]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{l.code.toUpperCase()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.secondaryText}>{t("noLanguageSelected")}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.outlineBtn} onPress={openLanguageModal}>
          <Text style={styles.outlineText}>{t("selectLanguages")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepWhenWhere({
  t,
  form,
  onChange,
  addressQuery,
  setAddressQuery,
  suggestions,
  selectSuggestion,
  latLng,
  customCountry,
  setCustomCountry,
  openSchedule,
  formatDateTime,
  errors,
  showErrors,
  scheduleHint,
}) {
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("location")}</Text>
        <View style={styles.dropdown}>
          {["Romania", "USA", "UK", "Germany", "France", "Spain", "Italy", "Other"].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.country === c && styles.chipActive]}
              onPress={() => {
                onChange("country", c);
                const map = {
                  Romania: "RO",
                  USA: "US",
                  UK: "GB",
                  Germany: "DE",
                  France: "FR",
                  Spain: "ES",
                  Italy: "IT",
                };
                onChange("countryCode", map[c] || "RO");
                if (c === "Other") setCustomCountry("");
              }}
            >
              <Text style={{ color: form.country === c ? "#fff" : "#0f172a" }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {form.country === "Other" ? (
          <TextInput
            placeholder={t("enterCountry")}
            value={customCountry}
            onChangeText={(v) => {
              setCustomCountry(v);
              onChange("country", v);
              onChange("countryCode", (v || "").toLowerCase().includes("rom") ? "RO" : "");
            }}
            style={styles.input}
            placeholderTextColor={"#9ca3af"}
          />
        ) : null}

        <TextInput
          placeholder={t("searchAddressPlaceholder")}
          value={addressQuery}
          onChangeText={setAddressQuery}
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
                <Text style={{ color: "#0f172a" }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {latLng.lat && latLng.lng ? (
          <Text style={styles.geoHint}>
            {t("locationSet", { lat: latLng.lat.toFixed(4), lng: latLng.lng.toFixed(4) })}
          </Text>
        ) : null}

        <TextInput
          placeholder={t("city")}
          value={form.city}
          onChangeText={(v) => onChange("city", v)}
          style={styles.input}
          placeholderTextColor={"#9ca3af"}
        />

        <TextInput
          placeholder={t("street")}
          value={form.street}
          onChangeText={(v) => onChange("street", v)}
          style={styles.input}
          placeholderTextColor={"#9ca3af"}
        />

        <TextInput
          placeholder={t("streetNumber")}
          value={form.streetNumber}
          onChangeText={(v) => onChange("streetNumber", v)}
          style={styles.input}
          placeholderTextColor={"#9ca3af"}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("schedule")}</Text>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => openSchedule("start")}>
          <Ionicons name="calendar-outline" size={18} color="#0f172a" />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerLabel}>{t("start")}</Text>
            <Text style={styles.pickerText}>{formatDateTime(form.startsAt)}</Text>
          </View>
        </TouchableOpacity>
        {showErrors && errors.startsAt ? <Text style={styles.errorText}>{errors.startsAt}</Text> : null}

        <TouchableOpacity style={styles.scheduleBtn} onPress={() => openSchedule("end")}>
          <Ionicons name="time-outline" size={18} color="#0f172a" />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerLabel}>{t("end")}</Text>
            <Text style={styles.pickerText}>{formatDateTime(form.endsAt)}</Text>
          </View>
        </TouchableOpacity>
        {showErrors && errors.endsAt ? <Text style={styles.errorText}>{errors.endsAt}</Text> : null}

        <Text style={styles.pickerLabel}>{t("durationMinutesLabel")}</Text>
        <TextInput
          placeholder={t("durationMinutesPlaceholder")}
          value={String(form.durationMinutes || "")}
          onChangeText={(v) => onChange("durationMinutes", v.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={"#9ca3af"}
        />
        {showErrors && errors.durationMinutes ? <Text style={styles.errorText}>{errors.durationMinutes}</Text> : null}
        {showErrors && errors.endsAt ? <Text style={styles.secondaryText}>{t("scheduleHint")}</Text> : null}

        {form.startsAt && form.endsAt ? (
          <Text style={styles.summaryText}>
            {t("starts")}: {formatDateTime(form.startsAt)}{"\n"}{t("ends")}: {formatDateTime(form.endsAt)}
          </Text>
        ) : null}
        {scheduleHint ? <Text style={styles.secondaryText}>{scheduleHint}</Text> : null}
      </View>
    </View>
  );
}

function StepPricingMedia({
  t,
  form,
  onChange,
  pickImages,
  pickVideo,
  uploading,
  images,
  videoUrl,
  confirmSafe,
  setConfirmSafe,
  activityOptions,
  errors,
  showErrors,
  pricingMode,
  setPricingMode,
}) {
  return (
    <View style={{ gap: 16, paddingBottom: 90 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("pricing")}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <TouchableOpacity
            style={[styles.chip, pricingMode === "PAID" && styles.chipActive]}
            onPress={() => {
              setPricingMode("PAID");
            }}
          >
            <Text style={{ color: pricingMode === "PAID" ? "#fff" : "#0f172a" }}>{t("paid")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, pricingMode === "FREE" && styles.chipActive]}
            onPress={() => {
              setPricingMode("FREE");
              onChange("price", "0");
            }}
          >
            <Text style={{ color: pricingMode === "FREE" ? "#fff" : "#0f172a" }}>{t("free")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TextInput
            placeholder={t("price")}
            value={String(form.price || "")}
            onChangeText={(v) => onChange("price", v)}
            editable={pricingMode === "PAID"}
            style={[
              styles.input,
              { flex: 1, marginRight: 8 },
              pricingMode === "FREE" && { backgroundColor: "#f1f5f9", color: "#94a3b8" },
            ]}
            keyboardType="numeric"
            placeholderTextColor={"#9ca3af"}
         />
         <View style={{ flex: 1 }}>
           <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t("currency")}</Text>
           <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <TouchableOpacity style={[styles.chip, styles.chipActive]}>
                <Text style={{ color: "#fff" }}>RON</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {pricingMode === "PAID" && showErrors && errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
        {showErrors && errors.currencyCode ? <Text style={styles.errorText}>{errors.currencyCode}</Text> : null}
        {pricingMode === "FREE" ? (
          <Text style={styles.secondaryText}>{t("freeDepositInfo")}</Text>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t("media")}</Text>
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImages}>
            <Ionicons name="images" size={18} color="#fff" />
            <Text style={styles.mediaText}>{t("addImages")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mediaButton, { backgroundColor: "#0284c7" }]} onPress={pickVideo}>
            <Ionicons name="videocam" size={18} color="#fff" />
            <Text style={styles.mediaText}>{t("addVideo")}</Text>
          </TouchableOpacity>
        </View>
        {uploading ? <ActivityIndicator color={livadaiColors.primary} style={{ marginBottom: 12 }} /> : null}

        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((url, idx) => (
              <Image key={idx} source={{ uri: url }} style={styles.gridImage} />
            ))}
          </View>
        )}
        {videoUrl ? (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "#0284c7" }]}>
              <Text style={styles.badgeText}>{t("videoUploaded")}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setConfirmSafe(!confirmSafe)}>
          <Ionicons name={confirmSafe ? "checkbox-outline" : "square-outline"} size={22} color={confirmSafe ? livadaiColors.accent : "#6b7280"} />
          <Text style={styles.checkboxText}>{t("confirmSafe")}</Text>
        </TouchableOpacity>
        {showErrors && errors.confirmSafe ? <Text style={styles.errorText}>{errors.confirmSafe}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f7fb",
    gap: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    color: "#0f172a",
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  label: { color: "#6b7280", marginBottom: 6, fontWeight: "700" },
  dropdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  mediaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  coverCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginTop: 8,
    height: 180,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#eef2ff" },
  coverText: { color: livadaiColors.primary, fontWeight: "700", fontSize: 16 },
  coverOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  coverOverlayText: { color: "#fff", fontWeight: "700" },
  mediaButton: {
    flex: 1,
    backgroundColor: livadaiColors.accent,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mediaText: { color: "#fff", fontWeight: "700" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  checkboxText: { color: "#0f172a", flex: 1 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  gridImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  badge: {
    backgroundColor: livadaiColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { color: "#fff", fontWeight: "700" },
  counter: {
    position: "absolute",
    right: 12,
    bottom: 8,
    color: "#94a3af",
    fontSize: 12,
  },
  suggestionsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 160,
    marginBottom: 8,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  geoHint: {
    color: "#0f172a",
    marginBottom: 8,
    fontWeight: "600",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  pickerBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickerLabel: { color: "#64748b", fontWeight: "700" },
  pickerText: { color: "#0f172a", fontWeight: "700" },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: livadaiColors.primary,
    borderColor: livadaiColors.primary,
  },
  secondaryText: { color: "#6b7280" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: livadaiColors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineText: { color: livadaiColors.primary, fontWeight: "700" },
  summaryText: { color: "#334155", marginTop: 6, fontWeight: "600" },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  langBadge: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: livadaiColors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: {
    width: 90,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "700" },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: "#94a3b8" },
  progressHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  progressLabel: { fontWeight: "800", color: "#0f172a" },
  progressTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: livadaiColors.primary },
  progressTitle: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  stripeGateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  stripeGateTitle: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  stripeGateBody: { color: "#475569" },
  stripeGateBtn: {
    alignSelf: "flex-start",
    backgroundColor: livadaiColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  stripeGateBtnText: { color: "#fff", fontWeight: "800" },
  errorText: { color: "#b91c1c", marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    width: "100%",
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  modalBtnSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: livadaiColors.primary,
  },
  modalBtnText: { fontWeight: "800", color: "#0f172a" },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
});
