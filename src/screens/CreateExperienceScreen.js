import React, { useRef, useState } from "react";
import { View, TextInput, ScrollView, Text, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || Constants.expoConfig?.extra?.googlePlacesApiKey;

const extractAddress = (details) => {
  const comps = details?.address_components || [];
  const get = (type) => comps.find((c) => c.types?.includes(type))?.long_name || "";
  const city = get("locality") || get("administrative_area_level_1") || get("administrative_area_level_2");
  return {
    formattedAddress: details?.formatted_address || "",
    city,
    street: get("route"),
    streetNumber: get("street_number"),
    postalCode: get("postal_code"),
    country: get("country"),
    lat: details?.geometry?.location?.lat,
    lng: details?.geometry?.location?.lng,
  };
};

export default function CreateExperienceScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    durationMinutes: "",
    city: "",
    street: "",
    streetNumber: "",
    postalCode: "",
    country: "",
    location: null,
    mainImageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const placesRef = useRef(null);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        address: form.location?.formattedAddress || undefined,
        location: form.location || undefined,
        latitude: form.location?.lat,
        longitude: form.location?.lng,
      };
      await api.post("/experiences", payload);
      navigation.goBack();
    } catch (_e) {
      setError("Nu s-a putut crea experiența");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Search address</Text>
      <GooglePlacesAutocomplete
        ref={placesRef}
        placeholder="Search address"
        fetchDetails
        onPress={(data, details = null) => {
          const addr = extractAddress(details);
          setForm((f) => ({
            ...f,
            city: addr.city || f.city,
            street: addr.street || f.street,
            streetNumber: addr.streetNumber || f.streetNumber,
            postalCode: addr.postalCode || f.postalCode,
            country: addr.country || f.country,
            location: addr,
          }));
        }}
        query={{
          key: GOOGLE_KEY,
          language: "en",
        }}
        styles={{
          textInputContainer: styles.searchContainer,
          textInput: styles.searchInput,
          listView: styles.listView,
          row: styles.row,
        }}
        enablePoweredByContainer={false}
        minLength={3}
      />

      {["title", "description", "category", "price", "durationMinutes"].map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]?.toString() || ""}
          onChangeText={(v) => onChange(key, v)}
          style={styles.input}
        />
      ))}

      {["city", "street", "streetNumber", "postalCode", "country"].map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]?.toString() || ""}
          onChangeText={(v) => onChange(key, v)}
          style={styles.input}
        />
      ))}

      <TextInput
        placeholder="mainImageUrl"
        value={form.mainImageUrl}
        onChangeText={(v) => onChange("mainImageUrl", v)}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.button} onTouchEnd={loading ? undefined : onSubmit}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Create"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f7fb", gap: 10 },
  label: { color: "#0f172a", fontWeight: "700", marginBottom: 6 },
  searchContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, padding: 4 },
  searchInput: { height: 44, color: "#0f172a", fontSize: 15 },
  listView: { borderRadius: 12, backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1 },
  row: { padding: 10 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
  button: {
    backgroundColor: livadaiColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "800" },
  error: { color: "red", marginTop: 6 },
});
