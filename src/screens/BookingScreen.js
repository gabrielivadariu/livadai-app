import React, { useState } from "react";
import { View, TextInput, Button, Text, ActivityIndicator, Linking } from "react-native";
import api from "../services/api";

export default function BookingScreen({ route }) {
  const { experienceId } = route.params;
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onBook = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: booking } = await api.post("/bookings", { experienceId, date, timeSlot });
      const { data: checkout } = await api.post("/payments/create-checkout-session", { bookingId: booking._id });
      await Linking.openURL(checkout.checkoutUrl);
    } catch (e) {
      setError(e?.response?.data?.message || "Booking/payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      <TextInput
        placeholder="14:00-16:00"
        value={timeSlot}
        onChangeText={setTimeSlot}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {loading ? <ActivityIndicator /> : <Button title="Book & Pay" onPress={onBook} />}
    </View>
  );
}
