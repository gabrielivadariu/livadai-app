import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { livadaiColors } from "../theme/theme";

const content = {
  ro: {
    title: "Cum funcționează ca host pe LIVADAI",
    intro: [
      "LIVADAI este o platformă creată de exploratori pentru exploratori.",
      "Ca host, poți crea și oferi experiențe autentice, locale și reale.",
    ],
    sections: [
      {
        title: "1. Ce înseamnă să fii host",
        items: [
          "Creezi experiențe plătite sau gratuite",
          "Ești responsabil de conținut și desfășurare",
          "Experiențele trebuie să fie clare, reale și oneste",
        ],
      },
      {
        title: "2. Ce trebuie să faci ca să creezi o experiență",
        items: [
          "Să ai portofelul Stripe conectat și activ",
          "Să completezi corect experiența (titlu, descriere, locație)",
          "Să adaugi imagini reale",
          "Să respecți regulile platformei",
        ],
      },
      {
        title: "3. Comunicarea cu participanții (FOARTE IMPORTANT)",
        items: [
          "Comunicarea se face doar prin chatul din aplicație",
          "Poți trimite și primi mesaje înainte și după booking",
          "Este interzis să ceri bani în afara platformei",
          "Este interzis să modifici prețul după rezervare",
        ],
      },
      {
        title: "4. Plăți, anulări și siguranță",
        items: [
          "Plățile sunt procesate prin Stripe",
          "Dacă hostul anulează → participantul primește refund",
          "Neprezentarea hostului poate duce la penalizări",
          "LIVADAI poate interveni în caz de dispute",
        ],
      },
      {
        title: "5. Reguli importante",
        items: [
          "Conținut nud, sexual sau ilegal este interzis",
          "Experiențele trebuie să respecte legea locală",
          "Încălcările pot duce la suspendarea contului",
        ],
      },
    ],
  },
  en: {
    title: "How hosting works on LIVADAI",
    intro: [
      "LIVADAI is built by explorers, for explorers.",
      "As a host, you can create and offer authentic, local experiences.",
    ],
    sections: [
      {
        title: "1. What it means to be a host",
        items: [
          "You create paid or free experiences",
          "You are responsible for the experience delivery",
          "Experiences must be real, clear and honest",
        ],
      },
      {
        title: "2. What you need to do to create an experience",
        items: [
          "Have an active Stripe wallet",
          "Complete experience details (title, description, location)",
          "Upload real images",
          "Follow platform rules",
        ],
      },
      {
        title: "3. Communication with participants (VERY IMPORTANT)",
        items: [
          "Communication happens only via in-app chat",
          "You can message participants before and after booking",
          "Asking for payments outside the app is forbidden",
          "Changing the price after booking is forbidden",
        ],
      },
      {
        title: "4. Payments, cancellations and safety",
        items: [
          "Payments are processed via Stripe",
          "Host cancellation → participant receives a refund",
          "Host no-show may lead to penalties",
          "LIVADAI may intervene in disputes",
        ],
      },
      {
        title: "5. Important rules",
        items: [
          "Nude, sexual or illegal content is forbidden",
          "Experiences must follow local laws",
          "Violations may lead to account suspension",
        ],
      },
    ],
  },
};

export default function HowItWorksHostScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ro") ? "ro" : "en";
  const data = content[lang];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {data.intro.map((line) => (
        <Text key={line} style={styles.intro}>
          {line}
        </Text>
      ))}
      {data.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <Text key={item} style={styles.item}>
              {item}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: livadaiColors.background },
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  intro: { color: livadaiColors.secondaryText, lineHeight: 20 },
  section: { marginTop: 10, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: livadaiColors.primaryText },
  item: { color: livadaiColors.secondaryText, lineHeight: 20 },
});
