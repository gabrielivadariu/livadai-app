import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import HostDashboardScreen from "../screens/HostDashboardScreen";
import CreateActivityScreen from "../screens/CreateActivityScreen";
import EditExperienceScreen from "../screens/EditExperienceScreen";
import HostBookingsScreen from "../screens/HostBookingsScreen";
import ConversationsScreen from "../screens/ConversationsScreen";
import ChatScreen from "../screens/ChatScreen";
import HostProfileScreen from "../screens/HostProfileScreen";
import EditHostProfileScreen from "../screens/EditHostProfileScreen";
import HostWalletScreen from "../screens/HostWalletScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ExplorerProfileScreen from "../screens/ExplorerProfileScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import HostParticipantsScreen from "../screens/HostParticipantsScreen";
import GuestParticipationsScreen from "../screens/GuestParticipationsScreen";
import ExperienceDetailScreen from "../screens/ExperienceDetailScreen";
import HostedExperiencesScreen from "../screens/HostedExperiencesScreen";
import DeleteAccountScreen from "../screens/DeleteAccountScreen";
import { livadaiColors } from "../theme/theme";

const Stack = createNativeStackNavigator();
const backTitleOptions = {
  headerBackTitleVisible: false,
  headerBackTitle: "",
  headerBackTitleStyle: { display: "none" },
};
const getStackOptions = (navigation) => ({
  headerShown: false,
  headerStyle: { backgroundColor: "#f5f7fb" },
  headerTitleStyle: {
    color: livadaiColors.primary,
    fontWeight: "900",
    fontSize: 20,
  },
  headerTintColor: livadaiColors.primary,
  headerTitleAlign: "left",
  ...backTitleOptions,
  headerBackVisible: false,
  headerLeft: ({ tintColor, canGoBack }) =>
    canGoBack ? (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
      >
        <Ionicons name="chevron-back" size={22} color={tintColor || livadaiColors.primary} />
      </TouchableOpacity>
    ) : null,
});

export default function HostNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={({ navigation }) => getStackOptions(navigation)}>
      <Stack.Screen name="HostDashboard" component={HostDashboardScreen} options={{ title: "Host Dashboard", headerShown: false, ...backTitleOptions }} />
      <Stack.Screen name="CreateExperience" component={CreateActivityScreen} options={{ title: "Create Experience", headerShown: false, ...backTitleOptions }} />
      <Stack.Screen
        name="EditExperience"
        component={EditExperienceScreen}
        options={({ route }) => ({ title: route.params?.experience?.title || "Edit Experience", ...backTitleOptions })}
      />
      <Stack.Screen name="HostBookings" component={HostBookingsScreen} options={{ headerShown: true, title: t("hostBookingsTitle"), ...backTitleOptions }} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ headerShown: false, ...backTitleOptions }} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.otherUserName || route.params?.experienceTitle || "Chat",
          ...backTitleOptions,
        })}
      />
      <Stack.Screen name="HostProfile" component={HostProfileScreen} options={{ headerShown: true, title: t("hostProfileTitle"), ...backTitleOptions }} />
      <Stack.Screen name="EditHostProfile" component={EditHostProfileScreen} options={{ headerShown: true, title: t("editProfile"), ...backTitleOptions }} />
      <Stack.Screen name="HostWallet" component={HostWalletScreen} options={{ headerShown: true, title: t("walletTitle"), ...backTitleOptions }} />
      <Stack.Screen name="GuestParticipations" component={GuestParticipationsScreen} options={{ headerShown: true, title: t("hostGuestTitle"), ...backTitleOptions }} />
      <Stack.Screen name="HostedExperiences" component={HostedExperiencesScreen} options={{ headerShown: true, title: t("hostedExperiences"), ...backTitleOptions }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: true, title: t("deleteAccount"), ...backTitleOptions }} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={{ headerShown: false, ...backTitleOptions }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: t("notifications"), ...backTitleOptions }} />
      <Stack.Screen name="PublicProfile" component={ExplorerProfileScreen} options={{ headerShown: false, ...backTitleOptions }} />
      <Stack.Screen name="BookingDetailScreen" component={BookingDetailScreen} options={{ title: "Booking", ...backTitleOptions }} />
      <Stack.Screen name="HostParticipants" component={HostParticipantsScreen} options={{ title: "Participanți", ...backTitleOptions }} />
    </Stack.Navigator>
  );
}
