import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { useFocusEffect } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";

export default function HostWalletScreen({ navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({ available: 0, pending: 0, blocked: 0 });
  const [error, setError] = useState("");
  const [stripeStatus, setStripeStatus] = useState({ accountId: null, payoutsEnabled: false, chargesEnabled: false });

  const openLink = async (url) => {
    try {
      if (url) await Linking.openURL(url);
    } catch (e) {
      Alert.alert("", t("walletCannotOpenDashboard"));
    }
  };

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const statusRes = await api.get("/stripe/debug/host-status");
      const statusData = statusRes.data || {};
      const payoutsEnabled = statusData.payouts_enabled ?? statusData.isStripePayoutsEnabled;
      const chargesEnabled = statusData.charges_enabled ?? statusData.isStripeChargesEnabled;
      const acct = statusData.stripeAccountId;
      setStripeStatus({ accountId: acct, payoutsEnabled: !!payoutsEnabled, chargesEnabled: !!chargesEnabled });

      if (acct && payoutsEnabled) {
        const { data } = await api.get("/wallet/summary");
        setBalances(data || { available: 0, pending: 0, blocked: 0 });
      }
    } catch (e) {
      setError(t("walletLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    return () => sub?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t("walletTitle")} onBack={() => navigation.goBack()} />
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const Row = ({ label, value, color }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: color || "#0f172a" }]}>{Number(value || 0).toFixed(2)} RON</Text>
    </View>
  );

  const connectStripe = async () => {
    try {
      const { data } = await api.post("/stripe/create-host-account");
      if (data?.url) await Linking.openURL(data.url);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("walletCannotStartOnboarding"));
    }
  };

  const continueStripe = async () => {
    try {
      const { data } = await api.post("/stripe/create-onboarding-link");
      if (data?.url) await Linking.openURL(data.url);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("walletCannotStartOnboarding"));
    }
  };

  const openDashboard = async () => {
    try {
      const { data } = await api.get("/stripe/host-dashboard");
      if (data?.url) await Linking.openURL(data.url);
    } catch (e) {
      Alert.alert("", e?.response?.data?.message || t("walletCannotOpenDashboard"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("walletTitle")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {error ? <Text style={{ color: "#dc2626", marginBottom: 8 }}>{error}</Text> : null}

        {!stripeStatus.accountId && (
          <View style={styles.card}>
            <Text style={styles.rowValue}>{t("stripeConnectTitle")}</Text>
            <Text style={styles.note}>{t("stripeRequiredToCreate")}</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={connectStripe}>
              <Text style={styles.buttonText}>{t("stripeConnectTitle")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {stripeStatus.accountId && !stripeStatus.payoutsEnabled && (
          <View style={styles.card}>
            <Text style={[styles.rowValue, { color: "#f97316" }]}>{t("stripeInProgress", { defaultValue: "Configurare Stripe în curs" })}</Text>
            <Text style={styles.note}>{t("stripeFinishSetup", { defaultValue: "Finalizează configurarea Stripe pentru a putea primi plăți." })}</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={continueStripe}>
              <Text style={styles.buttonText}>{t("continueSetup")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { marginTop: 8, backgroundColor: "#0284c7" }]} onPress={openDashboard}>
              <Text style={styles.buttonText}>{t("openPayoutDashboard")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {stripeStatus.accountId && stripeStatus.payoutsEnabled && (
          <View style={styles.card}>
            <Text style={[styles.rowValue, { color: "#16a34a", marginBottom: 8 }]}>{t("stripeActive", { defaultValue: "Stripe activ" })}</Text>
            <Row label={t("availableBalance")} value={balances.available} color="#16a34a" />
            <Row label={t("pendingBalance")} value={balances.pending} color="#f97316" />
            <Row label={t("blockedBalance")} value={balances.blocked} color="#dc2626" />
            <Text style={styles.note}>{t("walletInfoSoon")}</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={openDashboard}>
              <Text style={styles.buttonText}>{t("openPayoutDashboard")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background },
  title: { fontSize: 22, fontWeight: "900", color: livadaiColors.primaryText, marginBottom: 12 },
  card: {
    backgroundColor: livadaiColors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: livadaiColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  rowLabel: { color: livadaiColors.secondaryText },
  rowValue: { fontWeight: "800", color: livadaiColors.primaryText },
  note: { color: livadaiColors.secondaryText, marginTop: 12 },
  button: {
    backgroundColor: livadaiColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
