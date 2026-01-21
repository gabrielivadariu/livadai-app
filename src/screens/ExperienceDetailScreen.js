import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
  Share,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { livadaiColors } from "../theme/theme";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Modal, TextInput } from "react-native";

const screenWidth = Dimensions.get("window").width;
const SUPPORTED_LANGUAGES = {
  ro: "Romanian",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  el: "Greek",
  tr: "Turkish",
  ar: "Arabic",
  he: "Hebrew",
  hi: "Hindi",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  cs: "Czech",
  hu: "Hungarian",
  bg: "Bulgarian",
  sr: "Serbian",
  hr: "Croatian",
  sk: "Slovak",
  uk: "Ukrainian",
};

export default function ExperienceDetailScreen({ route, navigation }) {
  const { id, bookingId } = route.params || {};
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [myBooking, setMyBooking] = useState(null);
  const [chatAllowed, setChatAllowed] = useState(false);
  const [hostPhone, setHostPhone] = useState("");
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [reporting, setReporting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id && !bookingId) {
        if (active) setLoading(false);
        return;
      }
      try {
        if (bookingId) {
          try {
            const { data } = await api.get(`/bookings/${bookingId}`);
            if (active && data?.experience) {
              setItem(data.experience);
            }
          } catch (_e) {
            // ignore booking fallback errors
          }
        }
        if (id) {
          try {
            const { data } = await api.get(`/experiences/${id}`);
            if (active) {
              setItem((prev) => (prev ? { ...prev, ...data } : data));
            }
          } catch (_e) {
            // ignore experience fetch errors when booking fallback exists
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, bookingId]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/users/me/favorites");
        if (!active) return;
        setIsFavorite((data || []).some((fav) => fav?._id === id));
      } catch (_e) {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  useEffect(() => {
    // If logged in, see if this user has a booking for the experience to enable chat
    if (!user) return;
    (async () => {
      try {
        const { data } = await api.get("/bookings/me");
        const booking = (data || []).find((b) => b.experience?._id === id);
        setMyBooking(booking || null);
        if (booking) {
          const allowedStatuses = new Set(["PAID", "COMPLETED", "DEPOSIT_PAID"]);
          setChatAllowed(allowedStatuses.has(booking.status));
        } else {
          setChatAllowed(false);
        }
      } catch (_e) {
        setMyBooking(null);
        setChatAllowed(false);
      }
    })();
  }, [id, user]);

  useEffect(() => {
    // If chat is allowed (booking paid/deposit) fetch host profile to get phone
    const fetchHostPhone = async () => {
      if (!chatAllowed || !item?.host?._id) return;
      try {
        const { data } = await api.get(`/hosts/${item.host._id}/profile`);
        if (data?.phone) setHostPhone(data.phone);
      } catch (_e) {
        setHostPhone("");
      }
    };
    fetchHostPhone();
  }, [chatAllowed, item?.host?._id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert(t("loginRequired", { defaultValue: "Please log in to save favorites." }));
      return;
    }
    if (favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      const { data } = await api.post(`/users/me/favorites/${id}`);
      setIsFavorite(!!data?.favorite);
    } catch (e) {
      Alert.alert(t("error"), e?.response?.data?.message || t("saveError", { defaultValue: "Could not update favorite" }));
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleShare = async () => {
    if (!item || shareBusy) return;
    setShareBusy(true);
    try {
      const baseUrl =
        process.env.EXPO_PUBLIC_SHARE_URL ||
        process.env.EXPO_PUBLIC_APP_URL ||
        "";
      const normalizedBase = baseUrl ? baseUrl.replace(/\/$/, "") : "";
      const shareUrl = normalizedBase
        ? `${normalizedBase}/experience/${id}`
        : `livadaiapp://experience/${id}`;
      const headline = `Descoperă „${item.title}” pe LIVADAI`;
      const snippet = item.shortDescription ? `\n${item.shortDescription}` : "";
      await Share.share({
        title: item.title,
        message: `${headline}${snippet}\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (e) {
      Alert.alert(t("error"), t("shareFailed", { defaultValue: "Could not open share sheet." }));
    } finally {
      setShareBusy(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!item) return <Text style={{ color: livadaiColors.primaryText }}>{t("notFound", { defaultValue: "Not found" })}</Text>;

  const images =
    item.images?.length
      ? item.images
      : item.coverImageUrl
        ? [item.coverImageUrl]
        : item.mainImageUrl
          ? [item.mainImageUrl]
          : [];

  const isFree = !item.price || Number(item.price) <= 0;
  const priceLabel = isFree ? t("free") : `${item.price} ${item.currencyCode || "RON"} / ${t("person", { defaultValue: "person" })}`;
  const availableSpots = item.availableSpots ?? item.remainingSpots ?? item.maxParticipants;
  const totalSeats = item.maxParticipants || 0;
  const occupiedSeats =
    item.activityType === "GROUP" && totalSeats
      ? Math.max(0, totalSeats - (availableSpots || 0))
      : 0;
  const spotsLabel =
    item.activityType === "GROUP"
      ? typeof availableSpots === "number"
        ? t("spotsLeft", { count: availableSpots })
        : t("groupExperience", { defaultValue: "Group experience" })
      : item.soldOut
        ? t("soldOut")
        : t("individualSpot");

  const totalPrice = (item.price || 0) * (item.activityType === "GROUP" ? qty : 1);
  const depositLabel = isFree
    ? item.currencyCode?.toLowerCase() === "ron"
      ? t("depositRON")
      : t("depositEUR")
    : null;

  const languageText =
    item.languages?.length && Array.isArray(item.languages)
      ? item.languages
          .map((code) => SUPPORTED_LANGUAGES[code] || code?.toUpperCase?.() || code)
          .filter(Boolean)
          .join(", ")
      : null;

  const envLabel =
    item.environment === "INDOOR"
      ? t("envIndoor")
      : item.environment === "BOTH"
      ? t("envBoth")
      : item.environment === "OUTDOOR"
      ? t("envOutdoor")
      : null;

  const showAvailable = item.activityType === "GROUP" && totalSeats > 1;
  const bookedSpots = item.activityType === "GROUP" && totalSeats ? occupiedSeats : 0;

  const handleBook = async () => {
    const now = new Date();
    const starts = item?.startsAt || item?.startDate;
    if (starts && new Date(starts) <= now) {
      Alert.alert("", t("experienceStartedCannotBook"));
      return;
    }
    if (user?._id && item?.host?._id && user._id === item.host._id) {
      Alert.alert("", t("experienceOwnCannotBook"));
      return;
    }
    try {
      const quantity = item.activityType === "GROUP" ? qty : 1;
      const { data } = await api.post("/payments/create-checkout", { experienceId: id, quantity });
      if (data.checkoutUrl) {
        if (isFree) {
          Alert.alert(t("depositTitle"), t("depositInfo"));
        }
        await Linking.openURL(data.checkoutUrl);
      }
    } catch (e) {
      const serverMessage = e?.response?.data?.message || "";
      if (serverMessage.toLowerCase().includes("own experience")) {
        Alert.alert("", t("experienceOwnCannotBook"));
      } else {
        Alert.alert("", serverMessage || t("paymentFailed", { defaultValue: "Payment failed" }));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.status === "cancelled" ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t("experienceCancelled", { defaultValue: "This experience has been cancelled and is no longer bookable." })}</Text>
        </View>
      ) : null}
      {/* Cover carousel */}
      <View style={[styles.coverWrapper, { marginTop: 12 }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setImageIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {(images.length ? images : ["https://via.placeholder.com/800x400"]).map((url, idx) => (
            <Image key={idx} source={{ uri: url }} style={styles.coverImage} />
          ))}
        </ScrollView>
        <View style={styles.dotRow}>
          {(images.length ? images : ["_"]).map((_, idx) => (
            <View key={idx} style={[styles.dot, imageIndex === idx && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.overlayActions}>
          <TouchableOpacity style={styles.roundBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundBtn} onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#ef4444" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.price, isFree && { color: "#16a34a" }]}>{priceLabel}</Text>
            {isFree ? <Text style={styles.secondaryText}>{t("depositInfo", { defaultValue: "Refundable deposit required to reserve." })}</Text> : null}
            {item.shortDescription ? <Text style={[styles.secondaryText, { marginTop: 4 }]} numberOfLines={2}>{item.shortDescription}</Text> : null}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color="#f59e0b" size={16} />
            <Text style={styles.ratingText}>
              {Number(item.rating_avg || 0).toFixed(1)} ({item.rating_count || 0} {t("reviewsLabel")})
            </Text>
          </View>
        </View>
        <View style={{ gap: 6, marginTop: 8 }}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#0f172a" />
            <Text style={styles.body}>{item.address || `${item.city || ""} ${item.country || ""}`}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#0f172a" />
            <Text style={styles.body}>
              {item.activityType === "GROUP"
                ? t("groupSlots", { booked: bookedSpots, total: totalSeats })
                : t("individualLabel")}
            </Text>
          </View>
          {myBooking?.quantity ? (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#0f172a" />
              <Text style={styles.body}>{t("myBookedSpots", { count: myBooking.quantity })}</Text>
            </View>
          ) : null}
          {envLabel ? (
            <View style={styles.infoRow}>
              <Ionicons name="leaf-outline" size={18} color="#0f172a" />
              <Text style={styles.body}>{envLabel}</Text>
            </View>
          ) : null}
          {languageText ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#0f172a" />
              <Text style={styles.body}>{languageText}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Host card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.hostName}>{item.host?.name || t("hostLabel", { defaultValue: "Host" })}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color={livadaiColors.accent} />
                <Text style={styles.secondaryText}>{t("verifiedHost")}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate("HostProfile", { hostId: item.host?._id })}>
            <Text style={styles.outlineText}>{t("viewHostProfile")}</Text>
          </TouchableOpacity>
        </View>
        {myBooking ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 12, opacity: chatAllowed ? 1 : 0.6 }]}
            onPress={() =>
              chatAllowed
                ? navigation.navigate("Chat", {
                    bookingId: myBooking._id,
                    experienceTitle: item.title,
                    otherUserName: item.host?.name,
                    otherUserId: item.host?._id,
                    otherUserAvatar: item.host?.avatar,
                  })
                : Alert.alert("", t("chatAfterPayment"))
            }
          >
            <Text style={styles.primaryBtnText}>
              {chatAllowed ? t("messageHost") : t("chatAfterPayment")}
            </Text>
          </TouchableOpacity>
        ) : null}
        {chatAllowed && hostPhone ? (
          <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: "#f1f5f9" }}>
            <Text style={{ color: "#0f172a", fontWeight: "700" }}>{t("phoneVisibleAfterBooking")}</Text>
            <Text style={{ color: "#0f172a", marginTop: 4 }}>{hostPhone}</Text>
          </View>
        ) : null}
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("aboutThisExperience")}</Text>
        <Text style={styles.body}>{item.description || item.shortDescription || t("noDescription")}</Text>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("location")}</Text>
        {item.address ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#0f172a" />
            <Text style={styles.body}>{item.address}</Text>
          </View>
        ) : (
          <Text style={styles.secondaryText}>{t("noAddress")}</Text>
        )}
        {item.latitude && item.longitude ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.title} />
          </MapView>
        ) : null}
      </View>

      {/* Schedule */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("schedule")}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#0f172a" />
          <Text style={styles.body}>
            {item.startsAt
              ? new Date(item.startsAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
              : item.startDate
                ? new Date(item.startDate).toLocaleDateString()
                : "-"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={18} color="#0f172a" />
          <Text style={styles.body}>
            {item.endsAt
              ? new Date(item.endsAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
              : item.endDate
                ? new Date(item.endDate).toLocaleDateString()
                : "-"}
          </Text>
        </View>
        {item.activityType === "GROUP" ? (
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#0f172a" />
            <Text style={styles.body}>
              {t("groupSize", { count: totalSeats || "-" })}{" "}
              {typeof availableSpots === "number" ? `· ${t("spotsLeft", { count: availableSpots })}` : ""}
            </Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#0f172a" />
            <Text style={styles.body}>{t("individualExperience")}</Text>
          </View>
        )}
      </View>

      {/* Booking */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("bookTickets")}</Text>
        {item.activityType === "GROUP" && !item.soldOut ? (
          <View style={styles.qtyRow}>
            <Text style={styles.body}>{t("quantity")}</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => {
                  const max = availableSpots ?? 1;
                  setQty((q) => Math.min(max, q + 1));
                }}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{isFree ? t("depositLabel") : t("total")}</Text>
          <Text style={styles.totalValue}>
            {isFree ? depositLabel : `${totalPrice} ${item.currencyCode || "RON"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.cta,
            (item.soldOut || item.status === "cancelled") && { backgroundColor: "#9ca3af" },
          ]}
          onPress={handleBook}
          disabled={item.soldOut || item.status === "cancelled"}
        >
          <Text style={styles.ctaText}>{item.soldOut || item.status === "cancelled" ? t("unavailable") : t("bookNow")}</Text>
        </TouchableOpacity>
      </View>

      {/* Report */}
      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => {
          setReportModal(true);
        }}
      >
        <Text style={styles.reportText}>{t("reportContent")}</Text>
      </TouchableOpacity>

      <Modal visible={reportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{t("reportTitle")}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t("reportReasonPlaceholder")}
              value={reportReason}
              onChangeText={setReportReason}
            />
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
              placeholder={t("reportCommentPlaceholder")}
              value={reportComment}
              onChangeText={setReportComment}
              multiline
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <TouchableOpacity onPress={() => setReportModal(false)} style={[styles.outlineBtn, { borderColor: "#cbd5e1" }]}>
                <Text style={[styles.outlineText, { color: "#334155" }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { paddingHorizontal: 16, opacity: reporting ? 0.6 : 1 }]}
                onPress={async () => {
                  try {
                    setReporting(true);
                    await api.post("/bookings/report-content", {
                      experienceId: id,
                      reason: reportReason,
                      comment: reportComment,
                    });
                    Alert.alert("", t("reportSent"));
                    setReportModal(false);
                    setReportReason("");
                    setReportComment("");
                  } catch (e) {
                    Alert.alert("", e?.response?.data?.message || t("reportFailed"));
                  } finally {
                    setReporting(false);
                  }
                }}
                disabled={reporting}
              >
                <Text style={styles.primaryBtnText}>{t("submit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f7fb",
    gap: 14,
  },
  coverWrapper: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: 10,
    marginBottom: 12,
  },
  coverImage: { width: screenWidth - 32, height: 340, resizeMode: "cover" },
  dotRow: { flexDirection: "row", justifyContent: "center", paddingVertical: 8, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#cbd5e1" },
  dotActive: { backgroundColor: livadaiColors.primary },
  overlayActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  roundBtn: {
    backgroundColor: "#fff",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: { color: "#0f172a", fontWeight: "900", fontSize: 22, marginBottom: 6 },
  price: { color: livadaiColors.accent, fontWeight: "800", fontSize: 16 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { color: "#0f172a", fontWeight: "600" },
  spots: { color: "#334155", marginTop: 6, fontWeight: "700" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  hostName: { color: "#0f172a", fontWeight: "800", fontSize: 16 },
  secondaryText: { color: "#64748b" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: livadaiColors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outlineText: { color: livadaiColors.primary, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: livadaiColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  body: { color: "#0f172a", lineHeight: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  map: { height: 180, borderRadius: 12, marginTop: 10 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: livadaiColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  qtyValue: { color: "#0f172a", fontWeight: "800", fontSize: 18, minWidth: 24, textAlign: "center" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  totalLabel: { color: "#0f172a", fontWeight: "700" },
  totalValue: { color: "#0f172a", fontWeight: "900", fontSize: 18 },
  cta: {
    backgroundColor: livadaiColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  reportBtn: {
    padding: 12,
    alignItems: "center",
  },
  reportText: { color: "#ef4444", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: livadaiColors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    color: livadaiColors.primaryText,
    marginTop: 8,
  },
  banner: {
    backgroundColor: "#fed7aa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerText: { color: "#7c2d12", fontWeight: "700" },
});
