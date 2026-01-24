import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { livadaiColors } from "../theme/theme";
import { useTranslation } from "react-i18next";

export default function InfoScreen({ route }) {
  const { i18n } = useTranslation();
  const title = route?.params?.title || "Info";
  const body = route?.params?.body || "Content coming soon.";
  const normalizedTitle = title.trim().toLowerCase();
  const isHowItWorks = ["cum funcționează", "how it works"].includes(normalizedTitle);
  const isTrustSafety = ["încredere și siguranță", "trust & safety", "trust and safety"].includes(normalizedTitle);
  const isAboutLivadai = ["despre livadai", "about livadai"].includes(normalizedTitle);
  const isPrivacyPolicy = ["politica de confidențialitate", "privacy policy"].includes(normalizedTitle);
  const isTerms = [
    "termeni și condiții",
    "termeni si conditii",
    "terms and conditions",
    "terms & conditions",
  ].includes(normalizedTitle);
  const isContact = ["contactează-ne", "contact us", "contact"].includes(normalizedTitle);
  const langIsRo = i18n.language?.startsWith("ro");
  const howItWorksRo = [
    { type: "step", text: "1. Descoperi experiențe reale" },
    { type: "text", text: "Explorezi experiențe create de gazde locale: activități, aventuri, momente autentice." },
    { type: "text", text: "Vezi clar ce primești, unde are loc experiența și dacă este gratuită sau contra cost." },
    { type: "step", text: "2. Rezervi simplu și sigur" },
    { type: "text", text: "Când faci o rezervare:" },
    { type: "text", text: "locul tău este confirmat" },
    { type: "text", text: "plata (dacă există) este procesată în siguranță prin aplicație" },
    { type: "text", text: "nu există plăți în afara LIVADAI" },
    { type: "text", text: "⚠️ O rezervare confirmată nu este rambursabilă, exact ca un bilet la teatru, cu excepțiile de mai jos." },
    { type: "step", text: "3. Comunicarea cu gazda" },
    { type: "text", text: "După rezervare:" },
    { type: "text", text: "poți trimite mesaje gazdei" },
    { type: "text", text: "poți apela gazda" },
    { type: "text", text: "stabiliți împreună locul exact de întâlnire și detalii finale" },
    { type: "text", text: "Totul se întâmplă doar în aplicație, pentru siguranța ambelor părți." },
    { type: "step", text: "4. Siguranță & corectitudine" },
    { type: "text", text: "LIVADAI are reguli clare:" },
    { type: "text", text: "❌ Dacă o experiență este listată ca gratuită, gazda nu are voie să ceară bani ulterior" },
    { type: "text", text: "❌ Dacă o gazdă cere bani prin mesaje sau apel pentru o experiență gratuită → raportează imediat" },
    { type: "text", text: "❌ Dacă gazda nu se prezintă, anulează fără motiv sau încearcă o înșelătorie → raportează" },
    { type: "step", text: "5. Politica de refund (foarte important)" },
    { type: "text", text: "Primești refund integral dacă:" },
    { type: "text", text: "gazda anulează experiența" },
    { type: "text", text: "gazda nu se prezintă" },
    { type: "text", text: "experiența nu are loc din vina gazdei" },
    { type: "text", text: "există tentativă de fraudă sau comportament necorespunzător confirmat" },
    { type: "text", text: "👉 Exploratorii NU primesc refund dacă renunță după ce au rezervat." },
    { type: "step", text: "6. După experiență" },
    { type: "text", text: "Dacă totul a decurs bine:" },
    { type: "text", text: "poți lăsa o recenzie" },
    { type: "text", text: "ajuți alți exploratori să aleagă corect" },
    { type: "text", text: "contribui la o comunitate sănătoasă" },
    { type: "text", text: "Recenziile sunt esențiale. Ele protejează comunitatea." },
    { type: "step", text: "7. Responsabilitatea fiecăruia" },
    { type: "text", text: "LIVADAI este o platformă de conectare." },
    { type: "text", text: "Siguranța începe cu:" },
    { type: "text", text: "atenție" },
    { type: "text", text: "comunicare clară" },
    { type: "text", text: "raportarea oricărui comportament suspect" },
    { type: "text", text: "Suntem aici să susținem comunitatea, dar transparența și bunul-simț sunt cheia." },
  ];
  const howItWorksEn = [
    { type: "step", text: "1. Discover real experiences" },
    { type: "text", text: "Explore experiences created by local hosts: activities, adventures, authentic moments." },
    { type: "text", text: "You clearly see what you get, where it takes place, and whether it is free or paid." },
    { type: "step", text: "2. Book simply and safely" },
    { type: "text", text: "When you book:" },
    { type: "text", text: "your spot is confirmed" },
    { type: "text", text: "payment (if any) is processed securely in the app" },
    { type: "text", text: "there are no payments outside LIVADAI" },
    { type: "text", text: "⚠️ A confirmed booking is non-refundable, just like a theater ticket, except in the cases below." },
    { type: "step", text: "3. Communicate with the host" },
    { type: "text", text: "After booking:" },
    { type: "text", text: "you can message the host" },
    { type: "text", text: "you can call the host" },
    { type: "text", text: "you agree on the exact meeting place and final details" },
    { type: "text", text: "Everything happens only in the app, for the safety of both parties." },
    { type: "step", text: "4. Safety & fairness" },
    { type: "text", text: "LIVADAI has clear rules:" },
    { type: "text", text: "❌ If an experience is listed as free, the host must not ask for money later" },
    { type: "text", text: "❌ If a host asks for money by message or call for a free experience → report immediately" },
    { type: "text", text: "❌ If the host does not show up, cancels without reason, or tries to scam → report" },
    { type: "step", text: "5. Refund policy (important)" },
    { type: "text", text: "You get a full refund if:" },
    { type: "text", text: "the host cancels the experience" },
    { type: "text", text: "the host does not show up" },
    { type: "text", text: "the experience does not take place due to the host" },
    { type: "text", text: "there is a confirmed fraud attempt or improper behavior" },
    { type: "text", text: "👉 Explorers do NOT get a refund if they cancel after booking." },
    { type: "step", text: "6. After the experience" },
    { type: "text", text: "If everything went well:" },
    { type: "text", text: "you can leave a review" },
    { type: "text", text: "you help other explorers choose correctly" },
    { type: "text", text: "you contribute to a healthy community" },
    { type: "text", text: "Reviews are essential. They protect the community." },
    { type: "step", text: "7. Everyone’s responsibility" },
    { type: "text", text: "LIVADAI is a connection platform." },
    { type: "text", text: "Safety starts with:" },
    { type: "text", text: "attention" },
    { type: "text", text: "clear communication" },
    { type: "text", text: "reporting any suspicious behavior" },
    { type: "text", text: "We are here to support the community, but transparency and common sense are key." },
  ];
  const trustSafetyRo = [
    { type: "section", text: "Comunicare directă cu gazda" },
    { type: "text", text: "După ce faci o rezervare, poți trimite mesaje sau suna direct gazda." },
    { type: "text", text: "La fel, gazda te poate contacta pentru detalii legate de experiență." },
    { type: "section", text: "Detalii clare înainte de întâlnire" },
    { type: "text", text: "Poți discuta direct cu gazda despre:" },
    { type: "text", text: "– locul exact de întâlnire" },
    { type: "text", text: "– ora" },
    { type: "text", text: "– echipamentul necesar" },
    { type: "text", text: "– orice alte detalii importante" },
    { type: "section", text: "Transparență și control" },
    { type: "text", text: "Toată comunicarea are loc în aplicație, astfel încât informațiile sunt clare și ușor de urmărit." },
    { type: "section", text: "Recenzii reale" },
    { type: "text", text: "După ce experiența s-a încheiat, poți lăsa o recenzie sinceră." },
    { type: "text", text: "Recenziile ajută alți utilizatori să ia decizii informate și mențin comunitatea corectă." },
    { type: "section", text: "Alegerea îți aparține" },
    { type: "text", text: "Fiecare experiență este diferită. Citește descrierea, comunică deschis și ia decizii care te fac să te simți în siguranță." },
    { type: "text", text: "Simplu. Uman. Fără promisiuni false." },
  ];
  const trustSafetyEn = [
    { type: "section", text: "Direct communication with the host" },
    { type: "text", text: "After you make a booking, you can message or call the host directly." },
    { type: "text", text: "Likewise, the host may contact you for details about the experience." },
    { type: "section", text: "Clear details before meeting" },
    { type: "text", text: "You can discuss directly with the host about:" },
    { type: "text", text: "– the exact meeting place" },
    { type: "text", text: "– time" },
    { type: "text", text: "– required equipment" },
    { type: "text", text: "– any other important details" },
    { type: "section", text: "Transparency and control" },
    { type: "text", text: "All communication happens in the app, so information is clear and easy to track." },
    { type: "section", text: "Real reviews" },
    { type: "text", text: "After the experience ends, you can leave an honest review." },
    { type: "text", text: "Reviews help others make informed decisions and keep the community fair." },
    { type: "section", text: "The choice is yours" },
    { type: "text", text: "Every experience is different. Read the description, communicate openly, and make decisions that make you feel safe." },
    { type: "text", text: "Simple. Human. No false promises." },
  ];
  const aboutLivadaiRo = [
    { type: "text", text: "LIVADAI s-a născut dintr-o nevoie reală." },
    { type: "text", text: "Suntem un cuplu de exploratori, pasionați de oameni, locuri și experiențe autentice. Am călătorit, am cunoscut gazde extraordinare și am simțit pe pielea noastră cât de greu este uneori să găsești experiențe reale, corecte și sigure." },
    { type: "text", text: "Așa a apărut LIVADAI." },
    { type: "text", text: "Nu dintr-o idee de business rece, ci din dorința de a aduce oamenii mai aproape unii de alții." },
    { type: "text", text: "Credem că experiențele adevărate schimbă oameni." },
    { type: "text", text: "Credem în simplitate, transparență și respect." },
    { type: "text", text: "LIVADAI este o aplicație 100% românească, creată cu grijă, pentru:" },
    { type: "text", text: "– exploratori care vor mai mult decât turism de suprafață" },
    { type: "text", text: "– gazde care vor să împărtășească pasiuni, nu doar servicii" },
    { type: "text", text: "– o comunitate bazată pe încredere și bun-simț" },
    { type: "text", text: "Nu promitem perfecțiune." },
    { type: "text", text: "Promitem intenție bună, reguli clare și o platformă care pune oamenii pe primul loc." },
    { type: "text", text: "LIVADAI este despre viață trăită frumos." },
    { type: "text", text: "Despre descoperire." },
    { type: "text", text: "Despre a fi prezent." },
  ];
  const aboutLivadaiEn = [
    { type: "text", text: "LIVADAI was born from a real need." },
    { type: "text", text: "We are a couple of explorers, passionate about people, places, and authentic experiences. We traveled, met extraordinary hosts, and felt firsthand how hard it can be to find real, fair, and safe experiences." },
    { type: "text", text: "That is how LIVADAI appeared." },
    { type: "text", text: "Not from a cold business idea, but from the desire to bring people closer to each other." },
    { type: "text", text: "We believe real experiences change people." },
    { type: "text", text: "We believe in simplicity, transparency, and respect." },
    { type: "text", text: "LIVADAI is a 100% Romanian app, created with care, for:" },
    { type: "text", text: "– explorers who want more than surface-level tourism" },
    { type: "text", text: "– hosts who want to share passions, not just services" },
    { type: "text", text: "– a community built on trust and common sense" },
    { type: "text", text: "We do not promise perfection." },
    { type: "text", text: "We promise good intent, clear rules, and a platform that puts people first." },
    { type: "text", text: "LIVADAI is about living beautifully." },
    { type: "text", text: "About discovery." },
    { type: "text", text: "About being present." },
  ];
  const contactRo = [
    { type: "text", text: "Pentru suport legat de experiențe, plăți, raportări sau siguranță pe platformă, ne poți contacta la:" },
    { type: "text", text: "📩 livadai.reports@gmail.com" },
    { type: "text", text: "În curând vom deschide și o linie telefonică de suport." },
    { type: "text", text: "—" },
    { type: "text", text: "Pentru colaborări profesionale, parteneriate sau propuneri de business, îl poți contacta direct pe fondator la:" },
    { type: "text", text: "📧 livadariu.ga@icloud.com" },
  ];
  const contactEn = [
    { type: "text", text: "For support related to experiences, payments, reports or platform safety, you can contact us at:" },
    { type: "text", text: "📩 livadai.reports@gmail.com" },
    { type: "text", text: "A dedicated phone support line will be available soon." },
    { type: "text", text: "—" },
    { type: "text", text: "For professional collaborations, partnerships or business inquiries, you can contact the founder directly at:" },
    { type: "text", text: "📧 livadariu.ga@icloud.com" },
  ];
  const privacyPolicyRo = [
    { type: "section", text: "POLITICA DE CONFIDENȚIALITATE – LIVADAI" },
    { type: "text", text: "Ultima actualizare: 12.01.2026" },
    { type: "section", text: "1. Introducere" },
    { type: "text", text: "LIVADAI respectă confidențialitatea ta și se angajează să protejeze datele personale în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația aplicabilă din România și Uniunea Europeană." },
    { type: "text", text: "Această Politică de Confidențialitate explică:" },
    { type: "text", text: "ce date colectăm" },
    { type: "text", text: "de ce le colectăm" },
    { type: "text", text: "cum le folosim" },
    { type: "text", text: "ce drepturi ai" },
    { type: "text", text: "Prin utilizarea aplicației LIVADAI, ești de acord cu această Politică de Confidențialitate." },
    { type: "section", text: "2. Cine suntem" },
    { type: "text", text: "LIVADAI este o platformă digitală românească ce conectează Exploratori și Gazde pentru experiențe locale." },
    { type: "text", text: "LIVADAI acționează strict ca intermediar tehnologic, nu ca organizator sau furnizor al experiențelor listate în platformă." },
    { type: "section", text: "3. Datele pe care le colectăm" },
    { type: "section", text: "3.1 Date furnizate de tine" },
    { type: "text", text: "Nume complet" },
    { type: "text", text: "Adresă de email" },
    { type: "text", text: "Număr de telefon" },
    { type: "text", text: "Parolă (stocată în formă criptată)" },
    { type: "text", text: "Poză de profil (opțional)" },
    { type: "text", text: "Mesaje schimbate în chat (doar după confirmarea rezervării)" },
    { type: "section", text: "3.2 Date colectate automat" },
    { type: "text", text: "ID utilizator" },
    { type: "text", text: "ID booking" },
    { type: "text", text: "Date tehnice de utilizare (loguri, rapoarte de erori)" },
    { type: "text", text: "Adresă IP (pentru securitate și prevenirea fraudelor)" },
    { type: "section", text: "4. Scop și temei legal pentru prelucrare" },
    { type: "text", text: "Prelucrăm datele pentru a:" },
    { type: "text", text: "crea și administra conturi" },
    { type: "text", text: "procesa rezervări și plăți" },
    { type: "text", text: "permite comunicarea între Exploratori și Gazde" },
    { type: "text", text: "preveni fraude și abuzuri" },
    { type: "text", text: "respecta obligații legale" },
    { type: "text", text: "👉 Nu vindem date personale." },
    { type: "text", text: "👉 Nu folosim datele pentru marketing către terți." },
    { type: "section", text: "5. Comunicare și chat" },
    { type: "text", text: "Chatul dintre Explorator și Gazdă este activ doar după o rezervare confirmată" },
    { type: "text", text: "Mesajele sunt folosite strict pentru coordonarea experienței" },
    { type: "text", text: "LIVADAI nu monitorizează conversațiile în timp real" },
    { type: "section", text: "Acces administrativ" },
    { type: "text", text: "Mesajele pot fi accesate doar în situații excepționale, cum ar fi:" },
    { type: "text", text: "investigații legale" },
    { type: "text", text: "raportări oficiale sau dispute" },
    { type: "text", text: "solicitări ale autorităților competente" },
    { type: "section", text: "6. Păstrarea datelor" },
    { type: "text", text: "Datele contului sunt păstrate cât timp contul rămâne activ" },
    { type: "text", text: "Datele din chat pot fi șterse automat după o perioadă limitată de la finalizarea experienței, pentru protecția confidențialității" },
    { type: "text", text: "Anumite date pot fi păstrate mai mult timp dacă legea o cere" },
    { type: "section", text: "7. Partajarea datelor" },
    { type: "text", text: "Datele pot fi partajate doar cu:" },
    { type: "text", text: "procesatori de plăți (ex. Stripe)" },
    { type: "text", text: "furnizori de infrastructură (hosting, servicii email)" },
    { type: "text", text: "autorități publice, când este obligatoriu legal" },
    { type: "text", text: "👉 Niciodată pentru publicitate sau marketing extern." },
    { type: "section", text: "8. Drepturile tale (GDPR)" },
    { type: "text", text: "Ai dreptul să:" },
    { type: "text", text: "accesеzi datele personale" },
    { type: "text", text: "corectezi datele inexacte" },
    { type: "text", text: "soliciți ștergerea contului" },
    { type: "text", text: "restricționezi sau să te opui prelucrării" },
    { type: "text", text: "depui plângere la autoritatea competentă de protecție a datelor" },
    { type: "section", text: "9. Securitatea datelor" },
    { type: "text", text: "LIVADAI implementează:" },
    { type: "text", text: "stocare criptată a parolelor" },
    { type: "text", text: "tokenuri de autentificare securizate" },
    { type: "text", text: "acces administrativ restricționat" },
    { type: "text", text: "audituri interne de securitate" },
    { type: "text", text: "Totuși, niciun sistem digital nu poate fi garantat 100% sigur." },
    { type: "section", text: "10. Modificări ale politicii" },
    { type: "text", text: "Putem actualiza această Politică de Confidențialitate periodic." },
    { type: "text", text: "Utilizarea continuă a aplicației constituie acceptarea versiunii actualizate." },
    { type: "section", text: "POLITICA DE RAMBURSARE – LIVADAI" },
    { type: "section", text: "1. Principiu general" },
    { type: "text", text: "LIVADAI funcționează similar achiziționării unui bilet la un eveniment (teatru, concert, workshop)." },
    { type: "text", text: "👉 Odată confirmată, rezervarea este finală și nerambursabilă, cu excepțiile de mai jos." },
    { type: "section", text: "2. Rambursări SE acordă dacă:" },
    { type: "text", text: "Exploratorul primește rambursare integrală dacă:" },
    { type: "text", text: "Gazda anulează experiența" },
    { type: "text", text: "Gazda nu se prezintă" },
    { type: "text", text: "Gazda încearcă fraudă sau denaturare" },
    { type: "text", text: "Gazda solicită plată suplimentară în afara platformei" },
    { type: "text", text: "Experiența este înșelătoare sau înșelătoare" },
    { type: "section", text: "3. Rambursări NU se acordă dacă:" },
    { type: "text", text: "Exploratorul se răzgândește" },
    { type: "text", text: "Exploratorul nu se prezintă" },
    { type: "text", text: "Exploratorul întârzie" },
    { type: "text", text: "Condiții meteo sau factori externi apar (dacă au fost clar menționați în descriere)" },
    { type: "section", text: "4. Raportarea problemelor" },
    { type: "text", text: "Toate problemele trebuie raportate imediat în aplicație." },
    { type: "text", text: "LIVADAI poate investiga și lua măsuri, inclusiv rambursări sau sancțiuni." },
    { type: "section", text: "5. Decizie finală" },
    { type: "text", text: "Toate deciziile de rambursare luate de LIVADAI sunt finale, în limitele legii aplicabile." },
    { type: "section", text: "6. Prevenirea fraudei" },
    { type: "text", text: "Orice tentativă de fraudă sau abuz poate duce la:" },
    { type: "text", text: "suspendarea contului" },
    { type: "text", text: "eliminarea permanentă a contului" },
    { type: "text", text: "raportarea către autoritățile competente" },
  ];
  const privacyPolicyEn = [
    { type: "section", text: "PRIVACY POLICY – LIVADAI" },
    { type: "text", text: "Last updated: 12.01.2026" },
    { type: "section", text: "1. Introduction" },
    { type: "text", text: "LIVADAI respects your privacy and is committed to protecting your personal data in accordance with Regulation (EU) 2016/679 (GDPR) and applicable Romanian and European legislation." },
    { type: "text", text: "This Privacy Policy explains:" },
    { type: "text", text: "what data we collect" },
    { type: "text", text: "why we collect it" },
    { type: "text", text: "how we use it" },
    { type: "text", text: "what rights you have" },
    { type: "text", text: "By using the LIVADAI application, you agree to this Privacy Policy." },
    { type: "section", text: "2. Who We Are" },
    { type: "text", text: "LIVADAI is a Romanian digital platform that connects Explorers and Hosts for local experiences." },
    { type: "text", text: "LIVADAI acts strictly as a technological intermediary, not as the organizer or provider of the experiences listed on the platform." },
    { type: "section", text: "3. Data We Collect" },
    { type: "section", text: "3.1 Data You Provide" },
    { type: "text", text: "Full name" },
    { type: "text", text: "Email address" },
    { type: "text", text: "Phone number" },
    { type: "text", text: "Password (stored in encrypted form)" },
    { type: "text", text: "Profile photo (optional)" },
    { type: "text", text: "Messages exchanged via in-app chat (only after booking confirmation)" },
    { type: "section", text: "3.2 Automatically Collected Data" },
    { type: "text", text: "User ID" },
    { type: "text", text: "Booking ID" },
    { type: "text", text: "Technical usage data (logs, error reports)" },
    { type: "text", text: "IP address (for security and fraud prevention purposes)" },
    { type: "section", text: "4. Purpose and Legal Basis for Processing" },
    { type: "text", text: "We process your data in order to:" },
    { type: "text", text: "create and manage user accounts" },
    { type: "text", text: "process bookings and payments" },
    { type: "text", text: "enable communication between Explorers and Hosts" },
    { type: "text", text: "prevent fraud and misuse" },
    { type: "text", text: "comply with legal obligations" },
    { type: "text", text: "👉 We do not sell personal data." },
    { type: "text", text: "👉 We do not use data for third-party marketing purposes." },
    { type: "section", text: "5. Communications and Chat" },
    { type: "text", text: "Chat between Explorer and Host is enabled only after a confirmed booking" },
    { type: "text", text: "Messages are used solely for coordination and communication regarding the experience" },
    { type: "text", text: "LIVADAI does not monitor conversations in real time" },
    { type: "section", text: "Administrative Access" },
    { type: "text", text: "Messages may be accessed only in exceptional situations, such as:" },
    { type: "text", text: "legal investigations" },
    { type: "text", text: "official reports or disputes" },
    { type: "text", text: "requests from competent authorities" },
    { type: "section", text: "6. Data Retention" },
    { type: "text", text: "Account data is retained as long as the account remains active" },
    { type: "text", text: "Chat data may be automatically deleted after a limited period following the completion of an experience, to protect privacy" },
    { type: "text", text: "Certain data may be retained longer when legally required" },
    { type: "section", text: "7. Data Sharing" },
    { type: "text", text: "Data may be shared only with:" },
    { type: "text", text: "payment processors (e.g. Stripe)" },
    { type: "text", text: "infrastructure providers (hosting, email services)" },
    { type: "text", text: "public authorities, when legally required" },
    { type: "text", text: "👉 Never for external advertising or marketing purposes." },
    { type: "section", text: "8. Your Rights (GDPR)" },
    { type: "text", text: "You have the right to:" },
    { type: "text", text: "access your personal data" },
    { type: "text", text: "correct inaccurate data" },
    { type: "text", text: "request deletion of your account" },
    { type: "text", text: "restrict or object to processing" },
    { type: "text", text: "lodge a complaint with the competent data protection authority" },
    { type: "section", text: "9. Data Security" },
    { type: "text", text: "LIVADAI implements:" },
    { type: "text", text: "encrypted password storage" },
    { type: "text", text: "secure authentication tokens" },
    { type: "text", text: "restricted administrative access" },
    { type: "text", text: "internal security audits" },
    { type: "text", text: "However, no digital system can be guaranteed to be 100% secure." },
    { type: "section", text: "10. Policy Changes" },
    { type: "text", text: "We may update this Privacy Policy from time to time." },
    { type: "text", text: "Continued use of the application constitutes acceptance of the updated version." },
    { type: "section", text: "REFUND POLICY – LIVADAI" },
    { type: "section", text: "1. General Principle" },
    { type: "text", text: "LIVADAI operates similarly to purchasing a ticket for an event (theater, concert, workshop)." },
    { type: "text", text: "👉 Once a booking is confirmed, it is final and non-refundable, except in the cases listed below." },
    { type: "section", text: "2. Refunds ARE granted if:" },
    { type: "text", text: "The Explorer is entitled to a full refund if:" },
    { type: "text", text: "The Host cancels the experience" },
    { type: "text", text: "The Host does not show up" },
    { type: "text", text: "The Host attempts fraud or misrepresentation" },
    { type: "text", text: "The Host requests additional payment outside the platform" },
    { type: "text", text: "The experience is misleading or deceptive" },
    { type: "section", text: "3. Refunds are NOT granted if:" },
    { type: "text", text: "The Explorer changes their mind" },
    { type: "text", text: "The Explorer does not attend" },
    { type: "text", text: "The Explorer arrives late" },
    { type: "text", text: "Weather conditions or external factors occur (if clearly disclosed in the experience description)" },
    { type: "section", text: "4. Reporting Issues" },
    { type: "text", text: "All issues must be reported immediately through the application." },
    { type: "text", text: "LIVADAI may investigate and take appropriate action, including refunds or sanctions." },
    { type: "section", text: "5. Final Decision" },
    { type: "text", text: "All refund decisions made by LIVADAI are final, within the limits of applicable law." },
    { type: "section", text: "6. Fraud Prevention" },
    { type: "text", text: "Any attempt at fraud or abuse may result in:" },
    { type: "text", text: "account suspension" },
    { type: "text", text: "permanent account removal" },
    { type: "text", text: "reporting to relevant authorities" },
  ];
  const termsRo = [
    { type: "section", text: "TERMENI ȘI CONDIȚII DE UTILIZARE – LIVADAI" },
    { type: "text", text: "Ultima actualizare: 12.01.2026" },
    { type: "section", text: "1. Introducere" },
    { type: "text", text: "LIVADAI este o piață digitală care conectează exploratori (utilizatori) cu gazde independente care oferă experiențe." },
    { type: "text", text: "LIVADAI nu organizează, nu deține, nu administrează, nu supraveghează și nu controlează experiențele listate pe platformă." },
    { type: "text", text: "Prin accesarea sau utilizarea LIVADAI, accepți acești Termeni și Condiții." },
    { type: "section", text: "2. Definiții" },
    { type: "text", text: "Platformă – aplicația mobilă LIVADAI și serviciile aferente" },
    { type: "text", text: "Explorator – utilizator care rezervă experiențe" },
    { type: "text", text: "Gazdă – persoană independentă care oferă experiențe" },
    { type: "text", text: "Experiență – activitate listată de o Gazdă" },
    { type: "text", text: "Booking – rezervare confirmată prin platformă" },
    { type: "section", text: "3. Rolul LIVADAI (IMPORTANT)" },
    { type: "text", text: "LIVADAI acționează exclusiv ca platformă de intermediere." },
    { type: "text", text: "LIVADAI:" },
    { type: "text", text: "❌ nu este parte într-un acord între Explorator și Gazdă" },
    { type: "text", text: "❌ nu garantează calitatea, siguranța, legalitatea sau acuratețea experiențelor" },
    { type: "text", text: "❌ nu supraveghează experiențele" },
    { type: "text", text: "❌ nu angajează Gazdele" },
    { type: "text", text: "Toată responsabilitatea pentru experiențe revine exclusiv Gazdei." },
    { type: "section", text: "4. Înregistrarea contului" },
    { type: "text", text: "Utilizatorii trebuie să:" },
    { type: "text", text: "ofere informații corecte și complete" },
    { type: "text", text: "aibă minimum 18 ani" },
    { type: "text", text: "păstreze credențialele de login în siguranță" },
    { type: "text", text: "LIVADAI poate suspenda sau închide conturi care furnizează informații false sau încalcă acești termeni." },
    { type: "section", text: "5. Rezervări și plăți" },
    { type: "text", text: "Plățile sunt procesate prin LIVADAI." },
    { type: "text", text: "Un booking devine valid doar după confirmarea plății." },
    { type: "text", text: "Booking-urile sunt finale și nerambursabile după confirmare, similar cu achiziționarea unui bilet la un eveniment." },
    { type: "section", text: "6. Anulări și rambursări" },
    { type: "text", text: "Anulare de către Gazdă:" },
    { type: "text", text: "Dacă Gazda anulează o experiență sau nu se prezintă:" },
    { type: "text", text: "Exploratorul primește rambursare integrală" },
    { type: "text", text: "Gazda poate primi penalizări sau suspendare" },
    { type: "text", text: "Anulare de către Explorator:" },
    { type: "text", text: "Nu se acordă rambursări după confirmare, exceptând cazurile prevăzute de lege" },
    { type: "section", text: "7. Siguranță și responsabilitate" },
    { type: "text", text: "Exploratorii recunosc că:" },
    { type: "text", text: "experiențele pot implica riscuri inerente" },
    { type: "text", text: "participarea este voluntară și pe propria răspundere" },
    { type: "text", text: "LIVADAI nu este responsabilă pentru accidente, răniri, pierderi sau daune" },
    { type: "text", text: "Exploratorii sunt responsabili pentru:" },
    { type: "text", text: "siguranța personală" },
    { type: "text", text: "starea de sănătate" },
    { type: "text", text: "respectarea instrucțiunilor Gazdei" },
    { type: "section", text: "8. Conduită interzisă" },
    { type: "text", text: "Utilizatorii NU trebuie să:" },
    { type: "text", text: "ocolească plățile" },
    { type: "text", text: "solicite sau ofere plăți în afara platformei" },
    { type: "text", text: "denatureze experiențele" },
    { type: "text", text: "hărțuiască, amenințe sau înșele alți utilizatori" },
    { type: "text", text: "Dacă o Gazdă oferă o experiență gratuită și ulterior cere plată în privat, Exploratorii trebuie să raporteze imediat." },
    { type: "section", text: "9. Comunicare și chat" },
    { type: "text", text: "Comunicarea între Explorator și Gazdă este activată doar după booking" },
    { type: "text", text: "Chatul este oferit pentru coordonarea logisticii (loc, timp, detalii)" },
    { type: "text", text: "LIVADAI poate accesa chatul doar în caz de dispute legale, raportări sau investigații" },
    { type: "section", text: "10. Recenzii și evaluări" },
    { type: "text", text: "Recenziile trebuie să fie oneste și factuale" },
    { type: "text", text: "LIVADAI poate elimina recenzii abuzive sau false" },
    { type: "text", text: "Recenziile nu reprezintă opinia LIVADAI" },
    { type: "section", text: "11. Raportări și dispute" },
    { type: "text", text: "Utilizatorii pot raporta:" },
    { type: "text", text: "Gazde" },
    { type: "text", text: "Exploratori" },
    { type: "text", text: "Experiențe" },
    { type: "text", text: "LIVADAI poate:" },
    { type: "text", text: "investiga raportările" },
    { type: "text", text: "suspenda sau bloca conturi" },
    { type: "text", text: "acorda rambursări unde este cazul" },
    { type: "section", text: "12. Date și confidențialitate" },
    { type: "text", text: "Datele personale sunt prelucrate conform Politicii de Confidențialitate." },
    { type: "text", text: "LIVADAI nu vinde date personale." },
    { type: "section", text: "13. Limitarea răspunderii" },
    { type: "text", text: "În limita maximă permisă de lege, LIVADAI nu răspunde pentru:" },
    { type: "text", text: "vătămări" },
    { type: "text", text: "daune materiale" },
    { type: "text", text: "pierderi financiare" },
    { type: "text", text: "fraude comise de utilizatori" },
    { type: "text", text: "anulări în afara controlului platformei" },
    { type: "section", text: "14. Despăgubiri" },
    { type: "text", text: "Utilizatorii sunt de acord să despăgubească LIVADAI pentru orice pretenții rezultate din:" },
    { type: "text", text: "acțiunile lor" },
    { type: "text", text: "experiențele lor" },
    { type: "text", text: "încălcarea acestor termeni" },
    { type: "section", text: "15. Legea aplicabilă" },
    { type: "text", text: "Acești termeni sunt guvernați de legea română." },
    { type: "section", text: "16. Modificări" },
    { type: "text", text: "LIVADAI poate actualiza acești termeni oricând. Utilizarea continuă înseamnă acceptarea lor." },
  ];
  const termsEn = [
    { type: "section", text: "TERMS AND CONDITIONS OF USE – LIVADAI" },
    { type: "text", text: "Last updated: 12.01.2026" },
    { type: "section", text: "1. Introduction" },
    { type: "text", text: "LIVADAI is a digital marketplace that connects explorers (users) with independent hosts who offer experiences." },
    { type: "text", text: "LIVADAI does not organize, own, manage, supervise, or control experiences listed on the platform." },
    { type: "text", text: "By accessing or using LIVADAI, you agree to be bound by these Terms & Conditions." },
    { type: "section", text: "2. Definitions" },
    { type: "text", text: "Platform – LIVADAI mobile application and related services" },
    { type: "text", text: "Explorer – user booking experiences" },
    { type: "text", text: "Host – independent individual offering experiences" },
    { type: "text", text: "Experience – activity listed by a Host" },
    { type: "text", text: "Booking – confirmed reservation made through the platform" },
    { type: "section", text: "3. Role of LIVADAI (IMPORTANT)" },
    { type: "text", text: "LIVADAI acts solely as an intermediary platform." },
    { type: "text", text: "LIVADAI:" },
    { type: "text", text: "❌ is not a party to any agreement between Explorer and Host" },
    { type: "text", text: "❌ does not guarantee the quality, safety, legality, or accuracy of experiences" },
    { type: "text", text: "❌ does not supervise experiences" },
    { type: "text", text: "❌ does not employ Hosts" },
    { type: "text", text: "All responsibility for experiences lies exclusively with the Host." },
    { type: "section", text: "4. Account Registration" },
    { type: "text", text: "Users must:" },
    { type: "text", text: "Provide accurate and complete information" },
    { type: "text", text: "Be at least 18 years old" },
    { type: "text", text: "Keep login credentials secure" },
    { type: "text", text: "LIVADAI may suspend or terminate accounts that provide false information or violate these Terms." },
    { type: "section", text: "5. Bookings & Payments" },
    { type: "text", text: "Payments are processed through LIVADAI." },
    { type: "text", text: "A booking becomes valid only after payment confirmation." },
    { type: "text", text: "Bookings are final and non-refundable once confirmed, similar to purchasing an event ticket." },
    { type: "section", text: "6. Cancellations & Refunds" },
    { type: "text", text: "Host cancellation:" },
    { type: "text", text: "If a Host cancels an experience or does not show up:" },
    { type: "text", text: "Explorer is entitled to a full refund" },
    { type: "text", text: "Host may face penalties or account suspension" },
    { type: "text", text: "Explorer cancellation:" },
    { type: "text", text: "No refunds after confirmation unless required by law" },
    { type: "section", text: "7. Safety & Responsibility" },
    { type: "text", text: "Explorers acknowledge that:" },
    { type: "text", text: "Experiences may involve inherent risks" },
    { type: "text", text: "Participation is voluntary and at own risk" },
    { type: "text", text: "LIVADAI is not responsible for accidents, injuries, losses, or damages" },
    { type: "text", text: "Explorers are responsible for:" },
    { type: "text", text: "Personal safety" },
    { type: "text", text: "Health conditions" },
    { type: "text", text: "Following Host instructions" },
    { type: "section", text: "8. Prohibited Conduct" },
    { type: "text", text: "Users must NOT:" },
    { type: "text", text: "Circumvent payments" },
    { type: "text", text: "Request or offer payments outside the platform" },
    { type: "text", text: "Misrepresent experiences" },
    { type: "text", text: "Harass, threaten, or scam other users" },
    { type: "text", text: "If a Host offers a free experience and later demands payment privately, Explorers must report immediately." },
    { type: "section", text: "9. Communication & Chat" },
    { type: "text", text: "Communication between Explorer and Host is enabled only after booking" },
    { type: "text", text: "Chat is provided to coordinate logistics (meeting point, timing, details)" },
    { type: "text", text: "LIVADAI may access chat data only in case of legal disputes, reports, or investigations." },
    { type: "section", text: "10. Reviews & Ratings" },
    { type: "text", text: "Reviews must be honest and factual" },
    { type: "text", text: "LIVADAI may remove abusive or false reviews" },
    { type: "text", text: "Reviews do not represent LIVADAI’s opinion" },
    { type: "section", text: "11. Reports & Disputes" },
    { type: "text", text: "Users may report:" },
    { type: "text", text: "Hosts" },
    { type: "text", text: "Explorers" },
    { type: "text", text: "Experiences" },
    { type: "text", text: "LIVADAI may:" },
    { type: "text", text: "Investigate reports" },
    { type: "text", text: "Suspend or ban accounts" },
    { type: "text", text: "Issue refunds where applicable" },
    { type: "section", text: "12. Data & Privacy" },
    { type: "text", text: "Personal data is processed according to the Privacy Policy." },
    { type: "text", text: "LIVADAI does not sell personal data." },
    { type: "section", text: "13. Limitation of Liability" },
    { type: "text", text: "To the maximum extent permitted by law, LIVADAI shall not be liable for:" },
    { type: "text", text: "Personal injury" },
    { type: "text", text: "Property damage" },
    { type: "text", text: "Financial loss" },
    { type: "text", text: "Fraud committed by users" },
    { type: "text", text: "Cancellations beyond platform control" },
    { type: "section", text: "14. Indemnification" },
    { type: "text", text: "Users agree to indemnify LIVADAI against any claims arising from:" },
    { type: "text", text: "Their actions" },
    { type: "text", text: "Their experiences" },
    { type: "text", text: "Violations of these Terms" },
    { type: "section", text: "15. Governing Law" },
    { type: "text", text: "These Terms are governed by the laws of Romania." },
    { type: "section", text: "16. Changes" },
    { type: "text", text: "LIVADAI may update these Terms at any time. Continued use means acceptance." },
  ];
  const howItWorks = langIsRo ? howItWorksRo : howItWorksEn;
  const trustSafety = langIsRo ? trustSafetyRo : trustSafetyEn;
  const aboutLivadai = langIsRo ? aboutLivadaiRo : aboutLivadaiEn;
  const contact = langIsRo ? contactRo : contactEn;
  const privacyPolicy = langIsRo ? privacyPolicyRo : privacyPolicyEn;
  const terms = langIsRo ? termsRo : termsEn;
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {isHowItWorks ? (
            <View style={styles.stack}>
              {howItWorks.map((item, index) => (
                <Text
                  key={`${item.type}-${index}`}
                  style={item.type === "step" ? styles.step : item.type === "section" ? styles.section : styles.body}
                >
                  {item.text}
                </Text>
              ))}
            </View>
          ) : isTrustSafety ? (
            <View style={styles.stack}>
              {trustSafety.map((item, index) => (
                <Text
                  key={`${item.type}-${index}`}
                  style={item.type === "section" ? styles.section : styles.body}
                >
                  {item.text}
                </Text>
              ))}
            </View>
          ) : isAboutLivadai ? (
            <View style={styles.stack}>
              {aboutLivadai.map((item, index) => (
                <Text key={`${item.type}-${index}`} style={styles.body}>
                  {item.text}
                </Text>
              ))}
            </View>
          ) : isPrivacyPolicy ? (
            <View style={styles.stack}>
              {privacyPolicy.map((item, index) => (
                <Text
                  key={`${item.type}-${index}`}
                  style={item.type === "section" ? styles.section : styles.body}
                >
                  {item.text}
                </Text>
              ))}
            </View>
          ) : isTerms ? (
            <View style={styles.stack}>
              {terms.map((item, index) => (
                <Text
                  key={`${item.type}-${index}`}
                  style={item.type === "section" ? styles.section : styles.body}
                >
                  {item.text}
                </Text>
              ))}
            </View>
          ) : isContact ? (
            <View style={styles.stack}>
              {contact.map((item, index) => {
                const match = item.text.match(emailRegex);
                if (match) {
                  const email = match[0];
                  return (
                    <TouchableOpacity key={`${item.type}-${index}`} onPress={() => Linking.openURL(`mailto:${email}`)}>
                      <Text style={[styles.body, styles.emailLink]}>{item.text}</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <Text key={`${item.type}-${index}`} style={styles.body}>
                    {item.text}
                  </Text>
                );
              })}
            </View>
          ) : (
            <Text style={styles.body}>{body}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  stack: { gap: 8 },
  body: { color: livadaiColors.secondaryText, fontSize: 15, lineHeight: 21 },
  step: { color: livadaiColors.primaryText, fontSize: 16, lineHeight: 22, fontWeight: "800" },
  section: { color: livadaiColors.primaryText, fontSize: 16, lineHeight: 22, fontWeight: "800", marginTop: 8 },
  emailLink: { color: livadaiColors.primary, fontWeight: "700" },
});
